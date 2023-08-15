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
            name: 'upScaledImage',
            type: 'image',
            title: 'Up Scaled Choodle Image'
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
        },
        {
            name: 'shouldMint',
            type: 'boolean',
            title: 'Should Mint?',
            initialValue: true
        },
        {
            name: 'mintedAt',
            type: 'datetime',
            title: 'Minted At'
        }
    ]
}
