export default {
    name: 'CertificateEmail',
    type: 'document',
    title: 'Certificate Email',
    fields: [
        {
            name: 'top',
            title: 'Heading Text',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'createdBy',
            title: 'Created By Text',
            description: 'e.g. "Created by " which will have author email appended',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'footer',
            title: 'Footer Text',
            type: 'array',
            of: [{type: 'block'}]
        }
    ]
}
