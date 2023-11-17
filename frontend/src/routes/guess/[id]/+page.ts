import {
  PUBLIC_ISR_BYPASS_TOKEN,
  PUBLIC_ISR_EXPIRATION_SECONDS,
} from "$env/static/public";
import { cachedReadOnlyClient } from "$lib/CMSUtils";
import type { PageLoad } from "./$types";

export const config = {
  isr: {
    expiration: PUBLIC_ISR_EXPIRATION_SECONDS || 600,
    bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
  },
};

export const load: PageLoad = async ({ params }) => {
  const challenge = await cachedReadOnlyClient.fetch(
    `*[_type == "challenge" && _id == $challengeId]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`,
    {
      challengeId: params.id,
    },
  ).catch((error) => {
    console.error(`load failure`, error);
    throw new error(404, `cms load failure for challenge id ${params.id}`);
  });

  return {
    challenge,
  };
};
