import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy" && gameName  == "defcon"] | order(_createdAt) [0]`)
  const challenges = await readOnlyClient.fetch(`*[_type == "challenge" && game == "defcon"]{..., choodle, challenger->{username}} | order(_createdAt desc)`)

  console.log(`load data: `, copy, challenges)
  return {
    copy,
    challenges,
  }
}
