export default {
    name: 'dailyPrompt',
    type: 'document',
    title: 'Daily Prompt',
    fields: [
        {
            name: 'prompt',
            type: 'string',
            title: 'Prompt',
            validation: Rule => Rule.required().max(14),
            description: 'Max 14 characters.'
        }

    ]
}
