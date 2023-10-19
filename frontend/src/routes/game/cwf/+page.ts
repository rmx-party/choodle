import {readOnlyClient} from "$lib/CMSUtils";
import {loading} from "$lib/store";

export async function load({params}) {
  loading.set(true)

  return {
    copy: readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`),
    challenges: readOnlyClient.fetch(`*[_type == "challenge"]{..., choodle, challenger->{username}} | order(_createdAt desc)`),
    games: readOnlyClient.fetch(`*[_type == "cwfgame"]{..., player1->{...}, player2->{...}, guessResults->{...}} | order(_createdAt desc)`)
  }
}
