import { cachedReadOnlyClient, readOnlyClient } from "$lib/CMSUtils";
import shuffle from "lodash/fp/shuffle";
import { error } from "@sveltejs/kit";

import { PUBLIC_ISR_BYPASS_TOKEN } from "$env/static/public";
import type { PageLoad } from "./$types";

export const config = {
  isr: {
    expiration: 1440,
    bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
  },
};

export const load: PageLoad = async ({ params }) => {
  let challenge;
  if (params.challengeId) {
    challenge = await readOnlyClient.fetch(
      `*[_type == "challenge" && _id == "${params.challengeId}"][0]`,
    );

    if (!challenge) {
      throw error(404);
    }
  }

  return {
    records: shuffle(
      await cachedReadOnlyClient.fetch(`*[_type == "gamePrompt"]`),
    ),
    challenge,
  };
};
