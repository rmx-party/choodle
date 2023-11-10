import { cachedReadOnlyClient, readOnlyClient } from "$lib/CMSUtils";
import shuffle from "lodash/fp/shuffle";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
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
}
