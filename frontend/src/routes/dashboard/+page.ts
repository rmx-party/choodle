import { cachedReadOnlyClient, readOnlyClient } from "$lib/CMSUtils";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

const slug = `dashboard`;

export const load: PageLoad = async () => {
  const pageContent = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const games = readOnlyClient.fetch(
    `*[_type == "cwfgame"]{..., currentChallenge->{..., challenger->{...}}, player1->{...}, player2->{...}, guessResults[]->{..., challenge->{...}}} | order(_createdAt desc)`,
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for game records`);
  });

  const challenges = readOnlyClient.fetch(
    `*[_type == "challenge"]{..., challenger->{...}}`,
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for challenge records`);
  });

  return {
    pageContent,
    games,
    challenges,
  };
};
