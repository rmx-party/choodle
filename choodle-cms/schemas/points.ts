export default {
  name: 'points',
  type: 'document',
  title: 'Points',
  fields: [
    {
      name: 'creator',
      title: 'the person who got the points',
      type: 'reference',
      to: {type: 'creator'}
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
    {
      name: 'reason',
      title: 'Reason the points were awarded',
      type: 'string'
    },
  ]
}
