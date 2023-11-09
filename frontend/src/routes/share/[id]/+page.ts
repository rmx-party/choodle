import { readOnlyClient } from "$lib/CMSUtils";
import type { PageLoad } from "./$types";

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
