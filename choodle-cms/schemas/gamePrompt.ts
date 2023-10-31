export default {
  name: 'gamePrompt',
  type: 'document',
  title: 'Game Prompt',
  fields: [
    {
      name: 'prompt',
      type: 'string',
      title: 'Prompt',
      validation: Rule => Rule.required().max(10),
      description: 'Max 10 characters.'
    },
    {
      name: 'hint',
      type: 'string',
      title: 'Hint 1',
      validation: Rule => Rule.max(60),
      description: 'Max 60 characters.'
    },
    {
      name: 'hint_2',
      type: 'string',
      title: 'Hint 2',
      validation: Rule => Rule.max(60),
      description: 'Max 60 characters.'
    },
    {
      name: 'hint_3',
      type: 'string',
      title: 'Hint 3',
      validation: Rule => Rule.max(60),
      description: 'Max 60 characters.'
    },
    {
      name: 'promptType',
      type: 'string',
      title: 'Prompt Type',
      validation: Rule => Rule.max(60),
      description: 'Max 60 characters.',
      initialValue: 'choodle-with-friends-word',
    },
  ]
}
