export default {
    name: 'viewChoodle',
    type: 'document',
    title: 'View Choodle',
    fields: [
        {
            name: 'tagline',
            title: 'Tagline',
            validation: Rule => Rule.required().max(36),
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'bottom',
            title: 'Bottom',
            type: 'array',
            of: [{type: 'block'}]
        }

    ]
}
