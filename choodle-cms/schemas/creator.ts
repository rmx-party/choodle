export default {
  name: 'creator',
  type: 'document',
  title: 'Creator',
  fields: [
    {
      name: 'email',
      type: 'string',
      title: 'Email address of creator, not verified',
    },
    {
      name: 'deviceIds',
      title: 'Device IDs associated with this creator',
      type: 'array',
      of: [{type: 'string'}]
    },
    {
      name: 'choodles',
      title: 'choodle drawings created by this creator',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'choodle'}]
        }
      ]
    },
    {
      name: 'games',
      title: 'games this player is participating in',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'challenge'}]
        }
      ]
    },
  ]
}
