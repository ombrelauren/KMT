import {defineArrayMember, defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'featuredProjects',
      title: 'Projects shown on the home page',
      description:
        "Choose which projects appear on the home page carousel, and drag them into the order you want. Projects not added here simply won't show up on the home page (they can still be on the Work page). Already-added projects won't show up again when you search for a new one.",
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'project'}],
          options: {
            filter: ({document}) => {
              const existingIds = (
                ((document as {featuredProjects?: {_ref: string}[]})?.featuredProjects ?? []).map(
                  (item) => item._ref,
                )
              ).filter(Boolean)

              return {
                filter: '!(_id in $excludedIds)',
                params: {excludedIds: existingIds},
              }
            },
          },
        }),
      ],
      validation: (Rule) => Rule.unique(),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Home Page'}
    },
  },
})
