import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
    name: 'default',
    title: 'Choodle CMS',

    projectId: 'tdnjp9se',
    dataset: 'staging',

    plugins: [deskTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
})
