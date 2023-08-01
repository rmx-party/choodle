export default {
    name: 'howto',
    type: 'document',
    title: 'Howto',
    fields: [
        {
            name: 'top',
            title: 'Howto',
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
