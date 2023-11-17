import { cachedReadOnlyClient, readOnlyClient } from "$lib/CMSUtils";
import { error } from "@sveltejs/kit";

import { PUBLIC_ISR_BYPASS_TOKEN } from "$env/static/public";
import type { PageLoad } from "./$types";

export const config = {
  isr: {
    expiration: 1440,
    bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
  },
};

const slug = "pick-challenge";

export const load: PageLoad = async ({ params }) => {
  const { challengeId } = params;
  let challenge;

  if (challengeId) {
    challenge = readOnlyClient.fetch(
      `*[_type == "challenge" && _id == $challengeId][0]`,
      { challengeId },
    ).catch((err) => {
      console.error(`load failure`, err);
      throw error(404, `cms load failure for challenge id ${challengeId}`);
    });
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
