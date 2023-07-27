export default {
    name: 'viewChoodle',
    type: 'document',
    title: 'View Choodle',
    fields: [
        {
            name: 'top',
            title: 'Top',
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
