'use client'

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {muxInput} from 'sanity-plugin-mux-input'
import {schemaTypes} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {publishAllProjectsAction} from './sanity/actions/publishAllProjectsAction'
import {migrateCoverVideosToMuxAction} from './sanity/actions/migrateCoverVideosToMuxAction'

// Project ID and dataset are not secrets — same values already used by
// src/lib/sanity.ts for reading content on the public site.
export default defineConfig({
  name: 'default',
  title: 'KMT',
  basePath: '/studio',

  projectId: 'idmbo52t',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool(), muxInput()],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) =>
      context.schemaType === 'project'
        ? [...prev, publishAllProjectsAction, migrateCoverVideosToMuxAction]
        : prev,
  },
})
