import {useState} from 'react'
// Subpath import, not the package root — see publishAllProjectsAction.tsx
// for why (a broken type declaration in @sanity/ui's root barrel).
import {useToast} from '@sanity/ui/toast'
import {useClient} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

// Sits next to Publish/Publish all (see sanity.config.ts). One-off migration
// for the home cover videos uploaded before Mux was wired up — they're
// still raw "file" values that don't match the homeCoverVideo field's new
// mux.video type. For each one, this hands its existing Sanity CDN URL to
// Mux via Sanity's own Mux add-on proxy (the same endpoint the Studio's
// built-in "upload from URL" uses), then points the field at the
// mux.videoAsset document that comes back. Requires Mux credentials to
// already be entered once in the Studio (Settings → this dataset's Mux
// config) — this action never sees the Mux Access Token/Secret itself,
// Sanity's backend holds those and does the proxying.
// A single slow/huge file (multi-GB) registering with Mux can take far
// longer than a normal request, or hang without ever resolving or
// rejecting — this bounds how long any one item is allowed to block before
// it's treated as a failure and the rest proceed.
const PER_ITEM_TIMEOUT_MS = 45_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms / 1000}s`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

export const migrateCoverVideosToMuxAction: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: '2024-03-05'})
  const toast = useToast()
  const [isRunning, setIsRunning] = useState(false)

  return {
    label: isRunning ? 'Migrating cover videos…' : 'Migrate cover videos to Mux',
    tone: 'positive',
    disabled: isRunning,
    onHandle: async () => {
      setIsRunning(true)
      try {
        const pending: Array<{_id: string; track: string; url: string | null}> = await client.fetch(
          `*[_type == "project" && homeCoverType == "video" && homeCoverVideo._type == "file"]{
            _id, track, "url": homeCoverVideo.asset->url
          }`,
        )

        if (pending.length === 0) {
          toast.push({
            status: 'info',
            title: 'Nothing to migrate',
            description: 'Every cover video already uses Mux.',
          })
          return
        }

        const dataset = client.config().dataset

        // Registering the ingest job with Mux is fire-and-forget (the actual
        // encoding always happens in Mux's background regardless), so these
        // run concurrently — one slow multi-GB file no longer blocks the
        // others behind it in a sequential queue.
        const results = await Promise.allSettled(
          pending.map(async (project) => {
            if (!project.url) throw new Error('No video file found on this project.')

            const muxBody = {
              input: [{type: 'video', url: project.url}],
              playback_policy: ['public'],
            }
            const filename = project.url.split('/').slice(-1)[0]

            const result = await withTimeout(
              client.request<{results?: Array<{document?: {_id: string}}>}>({
                url: `/addons/mux/assets/${dataset}`,
                method: 'POST',
                withCredentials: true,
                headers: {
                  'MUX-Proxy-UUID': crypto.randomUUID(),
                  'Content-Type': 'application/json',
                },
                query: {
                  muxBody: JSON.stringify(muxBody),
                  filename,
                  sanityVersion: '5.0.8',
                },
              }),
              PER_ITEM_TIMEOUT_MS,
            )

            const muxAssetDocId = result?.results?.[0]?.document?._id
            if (!muxAssetDocId) throw new Error('Mux did not return an asset document')

            await withTimeout(
              client
                .patch(project._id)
                .set({
                  homeCoverVideo: {
                    _type: 'mux.video',
                    asset: {_type: 'reference', _ref: muxAssetDocId},
                  },
                })
                .commit(),
              PER_ITEM_TIMEOUT_MS,
            )

            return project.track
          }),
        )

        let migratedCount = 0
        results.forEach((result, i) => {
          if (result.status === 'fulfilled') {
            migratedCount += 1
          } else {
            toast.push({
              status: 'error',
              title: `Failed to migrate "${pending[i].track}"`,
              description: result.reason instanceof Error ? result.reason.message : String(result.reason),
            })
          }
        })

        if (migratedCount > 0) {
          toast.push({
            status: 'success',
            title: `Started Mux encoding for ${migratedCount} video${migratedCount > 1 ? 's' : ''}`,
            description: 'Each one will show "preparing" until Mux finishes, then switch to ready on its own.',
          })
        }
      } catch (err) {
        toast.push({
          status: 'error',
          title: 'Migration failed to start',
          description: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setIsRunning(false)
        props.onComplete()
      }
    },
  }
}
