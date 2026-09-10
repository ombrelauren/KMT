import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    {name: 'about', title: 'About', default: true},
    {name: 'general', title: 'General'},
  ],
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site title',
      description:
        'Shown in the browser tab, and as "Site title — Page name" on every page (e.g. "KMT — Work").',
      type: 'string',
      group: 'general',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      description: 'The small icon shown in the browser tab. A square image works best.',
      type: 'image',
      group: 'general',
    }),
    defineField({
      name: 'mainText',
      title: 'Main text',
      description:
        "The About page text, from the intro paragraph down to \"Jad & Tarek\". Press Enter for a new paragraph — each line becomes its own paragraph on the site.",
      type: 'text',
      rows: 8,
      group: 'about',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'leftContact',
      title: 'Contact (left)',
      type: 'object',
      group: 'about',
      fields: [
        defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required()}),
      ],
    }),
    defineField({
      name: 'rightContact',
      title: 'Contact (right)',
      type: 'object',
      group: 'about',
      fields: [
        defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.required()}),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      description:
        "Add a link with the + button below. The label is what shows up on the site (e.g. Instagram), the URL is the link to your page.",
      type: 'array',
      group: 'about',
      of: [
        defineArrayMember({
          name: 'socialLink',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label (e.g. Instagram)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
