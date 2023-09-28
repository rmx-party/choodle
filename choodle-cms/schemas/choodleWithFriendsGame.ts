export default {
  name: 'choodleWithFriendsGame',
  type: 'document',
  title: 'Choodle With Friends Game',
  fields: [
    {
      name: 'player1CreatorId',
      type: 'string',
      title: 'Player Who Started the Game',
    },
    {
      name: 'gamePrompt',
      type: 'string',
      title: 'Game Prompt',
    },
    {
      name: 'currentPlayerId',
      type: 'string',
      title: 'Whose turn is it?',
    },
  ]
}
