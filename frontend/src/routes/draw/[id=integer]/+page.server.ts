import { cachedReadOnlyClient } from "$lib/CMSUtils";
import type { PageServerLoad } from "./$types";
import {
  PUBLIC_ISR_BYPASS_TOKEN,
  PUBLIC_ISR_EXPIRATION_SECONDS,
} from "$env/static/public";
import { findChallenge } from "$lib/server/storage";

// export const config = {
//   isr: {
//     expiration: PUBLIC_ISR_EXPIRATION_SECONDS || 600,
//     bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
//   },
// };

const slug = "draw";

export const load: PageServerLoad = async ({ params }) => {
  const pageContent = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((error) => {
    console.error(`load failure`, error);
    throw new error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const challenge = findChallenge({ id: Number(params.id) });

  return { pageContent, challenge };
};
