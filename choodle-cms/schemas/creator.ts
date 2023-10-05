export default {
  name: 'creator',
  type: 'document',
  title: 'Creator',
  fields: [
    {
      name: 'username',
      type: 'string',
      title: 'Username of creator',
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email address of creator, not verified',
    },
    {
      name: 'deviceIds',
      title: 'Device IDs associated with this creator',
      type: 'array',
      of: [{type: 'string'}],
      validation: Rule => Rule.unique()
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
      ],
      validation: Rule => Rule.unique()
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
      ],
      validation: Rule => Rule.unique()
    },
  ]
}
