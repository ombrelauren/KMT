import {useState} from 'react'
// Imported from the "toast" subpath, not the package root — @sanity/ui's
// own root barrel (index.d.ts) currently ships a broken duplicate
// declaration that types useToast as `never` (verified: this bug is
// present in every 4.x release, fixed in 3.x, not yet in a released fix).
// The subpath re-exports the same function correctly typed.
import {useToast} from '@sanity/ui/toast'
import {useClient} from 'sanity'
import type {DocumentActionComponent} from 'sanity'

// Sits next to the normal Publish button (see sanity.config.ts) but
// publishes every "project" document that has unpublished changes, not
// just the one currently open — so publishing all of them doesn't require
// opening each project one by one.
export const publishAllProjectsAction: DocumentActionComponent = (props) => {
  // The Actions API (sanity.action.document.publish) didn't exist before
  // 2024-05-23 — an older apiVersion here 404s instead of publishing.
  const client = useClient({apiVersion: '2025-02-19'})
  const toast = useToast()
  const [isRunning, setIsRunning] = useState(false)

  return {
    label: isRunning ? 'Publishing all…' : 'Publish all',
    tone: 'positive',
    disabled: isRunning,
    onHandle: async () => {
      setIsRunning(true)
      try {
        const draftIds: string[] = await client.fetch(
          `*[_type == $type && _id in path("drafts.**")]._id`,
          {type: props.type},
        )

        if (draftIds.length === 0) {
          toast.push({
            status: 'info',
            title: 'Nothing to publish',
            description: 'No unpublished changes were found.',
          })
          return
        }

        let publishedCount = 0
        for (const draftId of draftIds) {
          const publishedId = draftId.replace(/^drafts\./, '')
          try {
            // eslint-disable-next-line no-await-in-loop
            await client.action({
              actionType: 'sanity.action.document.publish',
              draftId,
              publishedId,
            })
            publishedCount += 1
          } catch (err) {
            toast.push({
              status: 'error',
              title: `Failed to publish "${publishedId}"`,
              description: err instanceof Error ? err.message : String(err),
            })
          }
        }

        if (publishedCount > 0) {
          toast.push({
            status: 'success',
            title: `Published ${publishedCount} project${publishedCount > 1 ? 's' : ''}`,
          })
        }
      } finally {
        setIsRunning(false)
        props.onComplete()
      }
    },
  }
}
