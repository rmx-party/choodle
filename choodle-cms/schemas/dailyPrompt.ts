export default {
    name: 'dailyPrompt',
    type: 'document',
    title: 'Daily Prompt',
    fields: [
        {
            name: 'prompt',
            type: 'string',
            title: 'Prompt',
            validation: Rule => Rule.required().max(60),
            description: 'Max 60 characters.'
        }

    ]
}
