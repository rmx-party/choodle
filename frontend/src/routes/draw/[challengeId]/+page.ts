import { readOnlyClient } from "$lib/CMSUtils";
import type { PageLoad } from "../$types";

export const load: PageLoad = async ({ params }) => {
  const challenge = readOnlyClient.fetch(
    `*[_type == "challenge" && _id == "${params.challengeId}"]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`,
  );

  return { challenge };
};
