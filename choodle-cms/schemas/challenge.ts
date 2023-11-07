export default {
  name: 'challenge',
  type: 'document',
  title: 'Choodle w/ Friends Challenge',
  fields: [
    {
      name: 'gameRef', // FIXME: migrate this to game
      type: 'reference',
      to: {type: 'cwfgame'}
    },
    {
      name: 'choodle',
      title: 'A choodle drawing based on a word prompt for someone to try to guess',
      type: 'reference',
      to: {type: 'choodle'}
    },
    {
      name: 'gamePrompt', // FIXME: migrate this to gamePrompt
      title: 'the prompt this challenge choodle is based on',
      type: 'reference',
      to: {type: 'gamePrompt'}
    },
    {
      name: 'challenger',
      title: 'the person who drew the choodle to be guessed',
      type: 'reference',
      to: {type: 'creator'}
    },
  ]
}
