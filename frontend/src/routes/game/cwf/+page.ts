import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`)
  const games = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsGame"] | order(_createdAt)`)

  console.log(`load data: `, copy)
  return {
    copy: copy,
    liveGames: games,
  }
}
