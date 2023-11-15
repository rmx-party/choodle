import { readOnlyClient } from '$lib/CMSUtils'
import type { PageLoad } from '../../../.svelte-kit/types/src/routes'

export const load: PageLoad = async () => {
  return {
    games: readOnlyClient.fetch(
      `*[_type == "cwfgame"]{..., currentChallenge->{..., challenger->{...}}, player1->{...}, player2->{...}, guessResults[]->{..., challenge->{...}}} | order(_createdAt desc)`
    ),
    challenges: readOnlyClient.fetch(`*[_type == "challenge"]{..., challenger->{...}}`),
  }
}
