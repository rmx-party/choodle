export default {
    name: 'CertificateEmail',
    type: 'document',
    title: 'Certificate Email',
    fields: [
        {
            name: 'emailSubject',
            title: 'Email Subject Line',
            type: 'string'
        },
        {
            name: 'top',
            title: 'Email Header Section',
            description: 'html content above image',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'createdBy',
            title: 'Created By Text',
            description: 'e.g. "Created by " line which will have author email appended',
            type: 'text'
        },
        {
            name: 'footer',
            title: 'Footer Section',
            description: 'html section below the structured content',
            type: 'array',
            of: [{type: 'block'}]
        },
        {
            name: 'blankCertificate',
            title: 'Blank Certificate',
            description: 'Overlay content is coded for a base of 1913 x 2550 currently',
            type: 'image'
        }
    ]
}
