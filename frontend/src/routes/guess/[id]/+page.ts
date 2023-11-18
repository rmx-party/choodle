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

const slug = "guess";

export const load: PageLoad = async ({ params }) => {
  const challengeId = params.id; // TODO: use challengeId with param matcher instead of id
  if (!challengeId) {
    throw new error(404, `challengeId is required`);
  }

  const pageContent = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((error) => {
    console.error(`load failure`, error); // TODO: craft some DRY handlers for this type stuff, distinguish between client mode and server mode, etc.
    throw new error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const challenge = cachedReadOnlyClient.fetch(
    `*[_type == "challenge" && _id == $challengeId]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`,
    {
      challengeId,
    },
  ).catch((error) => {
    console.error(`load failure`, error);
    throw new error(404, `cms load failure for challenge id ${challengeId}`);
  });

  return {
    pageContent,
    challenge,
  };
};
