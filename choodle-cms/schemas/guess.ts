export default {
  name: 'guess',
  type: 'document',
  title: 'Guess',
  fields: [
    {
      name: 'challenger',
      title: 'the person who drew the choodle to be guessed',
      type: 'reference',
      to: {type: 'creator'}
    },
    {
      name: 'guesser',
      title: 'the person who guessed the choodle',
      type: 'reference',
      to: {type: 'creator'}
    },
    {
      name: 'guesses',
      title: 'guesses for the challenge',
      type: 'array',
      of: [
        {
          type: 'string',
        }
      ],
    },
  ]
}
