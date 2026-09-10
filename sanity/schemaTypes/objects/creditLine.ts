import {defineField, defineType} from 'sanity'

export const creditLine = defineType({
  name: 'creditLine',
  title: 'Credit Line',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Role',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {label: 'label', value: 'value'},
    prepare({label, value}) {
      return {title: label, subtitle: value}
    },
  },
})
