import { readOnlyClient } from "$lib/CMSUtils";

export async function load() {
  return {
    games: readOnlyClient.fetch(
      `*[_type == "cwfgame"]{..., currentChallenge->{..., challenger->{...}}, player1->{...}, player2->{...}, guessResults[]->{..., challenge->{...}}} | order(_createdAt desc)`,
    ),
    challenges: readOnlyClient.fetch(
      `*[_type == "challenge"]{..., challenger->{...}}`,
    ),
  };
}
