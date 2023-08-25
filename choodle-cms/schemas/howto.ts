export default {
    name: 'howto',
    type: 'document',
    title: 'Howto',
    fields: [
        {
            name: 'tagline',
            title: 'Tagline',
            type: 'string'
        },
        {
            name: 'top',
            title: 'Top Text',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'bottom',
            title: 'Bottom Text',
            type: 'array',
            of: [{type: 'block'}]
        }
    ]
}
