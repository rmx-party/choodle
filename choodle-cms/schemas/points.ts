export default {
  name: 'points',
  type: 'document',
  title: 'Points',
  fields: [
    {
      name: 'reason',
      title: 'Reason the points were awarded',
      type: 'string'
    },
    {
      name: 'creator',
      title: 'the person who got the points',
      type: 'reference',
      to: {type: 'creator'}
    },
    {
      name: 'challenge',
      title: 'the challenge the points were earned on',
      type: 'reference',
      to: {type: 'challenge'}
    },
    {
      name: 'game',
      title: 'The game the points were earned in',
      type: 'string'
    },
    {
      name: 'amount',
      title: 'Number of Points',
      type: 'number'
    },
  ]
}
