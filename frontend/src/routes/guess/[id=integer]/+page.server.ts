import {
  PUBLIC_ISR_BYPASS_TOKEN,
  PUBLIC_ISR_EXPIRATION_SECONDS,
} from "$env/static/public";
import { cachedReadOnlyClient } from "$lib/CMSUtils";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { findChallenge } from "$lib/server/storage";

export const config = {
  isr: {
    expiration: PUBLIC_ISR_EXPIRATION_SECONDS || 600,
    bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
  },
};

const slug = "guess";

export const load: PageServerLoad = async ({ params }) => {
  const challengeId = Number(params.id);
  if (!challengeId) {
    throw error(404, `challengeId is required`);
  }

  const pageContent = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((error) => {
    console.error(`cms load failure`, error); // TODO: craft some DRY handlers for this type stuff, distinguish between client mode and server mode, etc.
    throw new error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const challenge = await findChallenge({ id: challengeId }).catch(
    (error) => {
      console.error(`db challenge load failure`, error); // TODO: craft some DRY handlers for this type stuff, distinguish between client mode and server mode, etc.
      throw new error(404, `db load failure for challenge ${challengeId}`);
    },
  );

  const challengePrompt = cachedReadOnlyClient.fetch(
    `*[_type == "gamePrompt" && _id == $promptId][0]`,
    { promptId: challenge?.promptSanityId },
  ).catch((error) => {
    console.error(`cms load failure`, error); // TODO: craft some DRY handlers for this type stuff, distinguish between client mode and server mode, etc.
    throw new error(
      404,
      `cms load failure for prompt ${challenge?.promptSanityId}`,
    );
  });

  return {
    pageContent,
    challenge,
    challengePrompt,
  };
};
