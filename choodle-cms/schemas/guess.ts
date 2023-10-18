export default {
  name: 'guess',
  type: 'document',
  title: 'Guess',
  fields: [
    {
      name: 'challenge',
      title: 'the challenge to guess',
      type: 'reference',
      to: {type: 'challenge'}
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
    {
      name: 'hintsUsed',
      title: 'Which hints did the guesser use?',
      type: 'array',
      of: [
        {
          type: 'string',
        }
      ],
    },
    {
      name: 'guessedCorrectly',
      title: 'Did the  ser guess correctly?',
      type: 'boolean',
    },
  ]
}
