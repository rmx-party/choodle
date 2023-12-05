import { cachedReadOnlyClient } from "$lib/CMSUtils";
import { error } from "@sveltejs/kit";

import { PUBLIC_ISR_BYPASS_TOKEN } from "$env/static/public";
import type { PageServerLoad } from "./$types";
import { findChallenge } from "$lib/server/storage";

// export const config = {
//   isr: {
//     expiration: 1440,
//     bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
//   },
// };

const slug = "pick-challenge";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  let challenge = null;

  if (id) {
    challenge = findChallenge({ id: Number(id) });
  }

  const pageContent = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const records = cachedReadOnlyClient.fetch(`*[_type == "gamePrompt"]`).catch(
    (err) => {
      console.error(`load failure`, err);
      throw error(404, `cms load failure for gamePrompt records`);
    },
  );

  return {
    pageContent,
    records,
    challenge,
  };
};
