export default {
  name: 'cwfgame',
  type: 'document',
  title: 'CWF Game',
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
