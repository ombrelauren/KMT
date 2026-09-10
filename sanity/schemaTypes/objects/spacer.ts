import {defineField, defineType} from 'sanity'

export const spacer = defineType({
  name: 'spacer',
  title: 'Spacer',
  type: 'object',
  fields: [
    defineField({
      name: 'marker',
      type: 'string',
      hidden: true,
      initialValue: 'spacer',
    }),
  ],
  preview: {
    prepare() {
      return {title: '— Spacer —'}
    },
  },
})
