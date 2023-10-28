import {cachedReadOnlyClient, readOnlyClient} from "$lib/CMSUtils";
import {loading} from "$lib/store";

export async function load({params}) {
  loading.set(true)

  return {
    copy: cachedReadOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`),
    games: readOnlyClient.fetch(`*[_type == "cwfgame"]{..., currentChallenge->{..., challenger->{...}}, player1->{...}, player2->{...}, guessResults[]->{..., challenge->{...}}} | order(_createdAt desc)`)
  }
}
