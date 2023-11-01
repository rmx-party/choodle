import { cachedReadOnlyClient, readOnlyClient } from '$lib/CMSUtils';

export async function load() {
  return {
    copy: cachedReadOnlyClient.fetch(
      `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`
    ),
    games: readOnlyClient.fetch(
      `*[_type == "cwfgame"]{..., currentChallenge->{..., challenger->{...}}, player1->{...}, player2->{...}, guessResults[]->{..., challenge->{...}}} | order(_createdAt desc)`
    ),
    challenges: readOnlyClient.fetch(`*[_type == "challenge"]{..., challenger->{...}}`),
  };
}
