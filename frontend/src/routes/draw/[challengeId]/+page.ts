import { readOnlyClient } from "$lib/CMSUtils";
import type { PageLoad } from "./$types";
import {
  PUBLIC_ISR_BYPASS_TOKEN,
  PUBLIC_ISR_EXPIRATION_SECONDS,
} from "$env/static/public";

export const config = {
  isr: {
    expiration: PUBLIC_ISR_EXPIRATION_SECONDS || 600,
    bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
  },
};

export const load: PageLoad = async ({ params }) => {
  const challenge = readOnlyClient.fetch(
    `*[_type == "challenge" && _id == "${params.challengeId}"]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`,
  );

  return { challenge };
};
