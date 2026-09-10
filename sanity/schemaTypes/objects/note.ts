import {defineField, defineType} from 'sanity'

export const note = defineType({
  name: 'note',
  title: 'Note',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {text: 'text'},
    prepare({text}) {
      return {title: text, subtitle: 'Note'}
    },
  },
})
