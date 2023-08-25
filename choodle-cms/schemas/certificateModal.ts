export default {
    name: 'CertificateModal',
    type: 'document',
    title: 'Certificate Modal',
    fields: [
        {
            name: 'title',
            title: 'Modal Title / Header',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'body',
            title: 'Modal Body Text',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'CTA',
            title: 'CTA button text',
            type: 'string',
        },
        {
            name: 'DeclineCTA',
            title: 'Decline CTA link text',
            type: 'string',
        },
        {
            name: 'Image',
            title: 'Image to show',
            type: 'image'
        }
    ]
}
