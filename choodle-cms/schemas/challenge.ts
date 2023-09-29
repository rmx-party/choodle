export default {
  name: 'challenge',
  type: 'document',
  title: 'Choodle w/ Friends Challenge',
  fields: [
    {
      name: 'gamePrompt',
      type: 'string',
      title: 'the prompt this challenge choodle is based on',
    },
    {
      name: 'choodle',
      title: 'A choodle drawing based on a word prompt for someone to try to guess',
      type: 'reference',
      to: {type: 'choodle'}
    },
    {
      name: 'challenger',
      title: 'the person who drew the choodle to be guessed',
      type: 'reference',
      to: {type: 'creator'}
    },
  ]
}
