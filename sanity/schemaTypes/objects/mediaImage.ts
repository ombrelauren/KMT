import {defineField, defineType} from 'sanity'

// This stays a native "image" type (with one extra field bolted on) rather
// than a generic object — that's what lets Sanity auto-detect dropped image
// files and add them without ever asking "is this an image or a video?".
export const mediaImage = defineType({
  name: 'mediaImage',
  title: 'Image',
  type: 'image',
  fields: [
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
  ],
  preview: {
    select: {media: 'asset', width: 'width'},
    prepare({media, width}) {
      return {
        title: width === 'half' ? '50%' : '100%',
        media,
      }
    },
  },
})
