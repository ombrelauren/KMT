import {defineField, defineType} from 'sanity'
import {createClearArrayInput} from '../components/ClearArrayInput'

const ClearMediaInput = createClearArrayInput('media', 'Clear media')
const ClearDescriptionInput = createClearArrayInput('description', 'Clear description')

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    {name: 'main', title: 'Info'},
    {name: 'coverHome', title: 'Home Page'},
    {name: 'coverWork', title: 'Work Page Cover'},
    {name: 'content', title: 'Content'},
  ],
  fields: [
    defineField({
      name: 'orderRank',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'artist',
      title: 'Artist Name',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'track',
      title: 'Project',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'track'},
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'main',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Music Video', value: 'music-video'},
          {title: 'Film', value: 'film'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Photography', value: 'photography'},
        ],
        layout: 'grid',
      },
      group: 'main',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'homeCoverType',
      title: 'Home Page Cover Type',
      type: 'string',
      options: {
        list: [
          {title: 'Video', value: 'video'},
          {title: 'Image', value: 'image'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'video',
      group: 'coverHome',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'homeCoverVideo',
      title: 'Cover Video',
      type: 'mux.video',
      hidden: ({parent}) => parent?.homeCoverType !== 'video',
      group: 'coverHome',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {homeCoverType?: string} | undefined
          if (parent?.homeCoverType === 'video' && !value) return 'Add a video'
          return true
        }),
    }),
    defineField({
      name: 'homeCoverImage',
      title: 'Cover Image',
      type: 'image',
      hidden: ({parent}) => parent?.homeCoverType !== 'image',
      group: 'coverHome',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {homeCoverType?: string} | undefined
          if (parent?.homeCoverType === 'image' && !value) return 'Add an image'
          return true
        }),
    }),
    defineField({
      name: 'homeHeaderColor',
      title: 'Header Color',
      type: 'string',
      options: {
        list: [
          {title: 'White', value: 'white'},
          {title: 'Black', value: 'black'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'white',
      group: 'coverHome',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'homeCaptionColor',
      title: 'Caption Color',
      type: 'string',
      options: {
        list: [
          {title: 'White', value: 'white'},
          {title: 'Black', value: 'black'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'white',
      group: 'coverHome',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'coverWork',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [{type: 'mediaImage'}, {type: 'mediaVideo'}],
      group: 'content',
      components: {input: ClearMediaInput},
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'creditLine'}, {type: 'note'}, {type: 'spacer'}],
      group: 'content',
      components: {input: ClearDescriptionInput},
    }),
  ],
  preview: {
    select: {artist: 'artist', track: 'track', media: 'coverImage'},
    prepare({artist, track, media}) {
      return {title: track, subtitle: artist, media}
    },
  },
})
