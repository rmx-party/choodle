import { cachedReadOnlyClient } from "$lib/CMSUtils";
import fp from "lodash/fp.js";

export async function load({ params }) {
  return {
    records: fp.shuffle(
      await cachedReadOnlyClient.fetch(`*[_type == "gamePrompt"]`),
    ),
  };
}
