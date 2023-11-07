export default {
  name: 'cwfgame', // FIXME: this should match the title, but we need to migrate.
  type: 'document',
  title: 'Streak',
  fields: [
    {
      name: 'player1',
      title: 'Player who created the first challenge',
      type: 'reference',
      to: {type: 'creator'}
    },
    {
      name: 'player2',
      title: 'Player who guessed the first challenge',
      type: 'reference',
      to: {type: 'creator'}
    },
    {
      name: 'currentChallenge',
      title: 'The current challenge to be guessed',
      type: 'reference',
      to: {type: 'challenge'}
    },
    {
      name: 'guessResults',
      title: 'results of guesses in this game',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'guess'}]
        }
      ],
      validation: Rule => Rule.unique()
    },
  ]
}
