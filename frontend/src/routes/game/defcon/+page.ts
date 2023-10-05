import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`)
  const challenges = await readOnlyClient.fetch(`*[_type == "challenge" && game == "defcon"] | order(_createdAt)`)

  const
    dummyGames = [ // TODO: speculative data model for page mockup purposes
      {
        _id: 1,
        turn: 'some-player-id',
        choodles: [], // Choodle association array
        guesses: [] // Guess entries / counts per choodle perhaps? guesses belong to a particular choodle, and a game, and player
      },
      {
        _id: 2,
        turn: 'other-player-id',
        choodles: [],
        guesses: []
      }
    ]

  console.log(`load data: `, copy, challenges)
  return {
    copy,
    challenges,
    liveGames: [...dummyGames],
  }
}
