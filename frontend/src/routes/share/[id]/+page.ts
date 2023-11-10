import {
  PUBLIC_ISR_BYPASS_TOKEN,
  PUBLIC_ISR_EXPIRATION_SECONDS,
} from "$env/static/public";
import { readOnlyClient } from "$lib/CMSUtils";
import type { PageLoad } from "./$types";

export const config = {
  isr: {
    expiration: PUBLIC_ISR_EXPIRATION_SECONDS || 600,
    bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
  },
};

export const load: PageLoad = async ({ params }) => {
  return {
    challenge: readOnlyClient.fetch(
      `*[_type == "challenge" && _id == "${params.id}"]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`,
    ).catch((e) => {
      console.error(e);
      throw Error(404);
    }),
  };
};
