export default {
    name: 'choodle',
    type: 'document',
    title: 'Choodle',
    fields: [
        {
            name: 'image',
            type: 'image',
            title: 'Choodle Image'
        },
        {
            name: 'title',
            type: 'string',
            title: 'Choodle Title'
        },
        {
            name: 'creatorId',
            type: 'string',
            title: 'Creator ID',
            readOnly: true
        }
    ]
}
