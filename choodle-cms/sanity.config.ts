import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
    name: 'default',
    title: 'Choodle CMS',

    projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.PUBLIC_SANITY_DATASET!,

    plugins: [deskTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
})
