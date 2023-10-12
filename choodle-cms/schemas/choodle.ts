export default {
  name: 'choodle',
  type: 'document',
  title: 'Choodle',
  fields: [
    {
      name: 'image',
      type: 'image',
      title: 'Choodle Image'
    },
    {
      name: 'upScaledImage',
      type: 'image',
      title: 'Up Scaled Choodle Image'
    },
    {
      name: 'title',
      type: 'string',
      title: 'Choodle Title'
    },
    {
      name: 'creatorId',
      type: 'string',
      title: 'Creator ID',
      readOnly: true
    },
    {
      name: 'shouldMint',
      type: 'boolean',
      title: 'Should Mint?',
      initialValue: true
    },
    {
      name: 'mintedAt',
      type: 'datetime',
      title: 'Minted At'
    },
    {
      name: 'tokenId',
      type: 'string',
      title: 'Token ID'
    },
    {
      name: 'sentTo',
      type: 'string',
      title: 'Sent To'
    },
    {
      name: 'sentAt',
      type: 'datetime',
      title: 'Sent At'
    },
    {
      name: 'certificate',
      type: 'image',
      title: 'Generated Certificate'
    },
    {
      name: 'gamePrompt',
      type: 'string',
      title: 'Selected Game Prompt',
      readOnly: true
    }
  ]
}
