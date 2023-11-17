import { cachedReadOnlyClient, readOnlyClient } from "$lib/CMSUtils";
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

const slug = "draw";

export const load: PageLoad = async ({ params }) => {
  const pageContent = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((error) => {
    console.error(`load failure`, error);
    throw new error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const challenge = readOnlyClient.fetch(
    `*[_type == "challenge" && _id == $challengeId]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`,
    { challengeId: params.challengeId },
  ).catch((error) => {
    console.error(`load failure`, error);
    throw new error(
      404,
      `cms load failure for challenge id ${params.challengeId}`,
    );
  });

  return { pageContent, challenge };
};
