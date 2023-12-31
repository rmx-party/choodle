import { cachedReadOnlyClient } from "$lib/CMSUtils";
import { error } from "@sveltejs/kit";

import { PUBLIC_ISR_BYPASS_TOKEN } from "$env/static/public";
import type { PageServerLoad } from "./$types";
import { findChallenge } from "$lib/server/storage";
import type { SanityDocument } from "@sanity/client";
import type { StreakGuessingGamePrompt } from "$lib/CWFGame";
import type { Challenge } from "@prisma/client";

// export const config = {
//   isr: {
//     expiration: 1440,
//     bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
//   },
// };

const slug = "pick-challenge";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  let challenge: Promise<Challenge | null> | null = null;

  if (id) {
    challenge = findChallenge({ id: Number(id) });
  }

  const pageContent: Promise<SanityDocument> = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const gamePrompts: Promise<StreakGuessingGamePrompt[]> = cachedReadOnlyClient
    .fetch(
      `*[_type == "gamePrompt"]{..., category->{...}}`,
    ).catch(
      (err) => {
        console.error(`load failure`, err);
        throw error(404, `cms load failure for gamePrompt records`);
      },
    );

  const categories: Promise<SanityDocument[]> = cachedReadOnlyClient.fetch(
    `*[_type == "promptCategory"]`,
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for promptCategory records`);
  });

  return {
    pageContent,
    gamePrompts,
    categories,
    challenge,
  };
};
