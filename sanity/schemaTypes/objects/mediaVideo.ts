import {defineField, defineType} from 'sanity'

// Was a native "file" type (see mediaImage.ts for why that mattered for
// bulk drag-drop auto-detection). Videos now go through Mux instead of
// sitting on Sanity's CDN uncompressed, so the actual file lives under the
// "video" sub-field (type mux.video, added by sanity-plugin-mux-input) —
// dropping a raw video file onto this array item still uploads it directly,
// but auto-detection when dropping MIXED image+video files onto the array
// itself no longer works (mux.video is a plain object, not a native file/
// image type), so adding a video here needs "Add item" → Video explicitly.
export const mediaVideo = defineType({
  name: 'mediaVideo',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      options: {
        list: [
          {title: '100%', value: 'full'},
          {title: '50%', value: 'half'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'full',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'controls',
      title: 'Player controls',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {width: 'width', controls: 'controls', playbackId: 'video.asset.playbackId'},
    prepare({width, controls, playbackId}) {
      const size = width === 'half' ? '50%' : '100%'
      return {
        title: size,
        subtitle: `${controls === false ? 'No controls' : 'Controls'}${playbackId ? '' : ' — no video yet'}`,
      }
    },
  },
})
