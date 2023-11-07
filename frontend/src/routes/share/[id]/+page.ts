import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  return {
    challenge: readOnlyClient.fetch(
      `*[_type == "challenge" && _id == "${params.id}"]{..., challenger->{...}, choodle->{...}, gamePrompt->{...}} [0]`,
    ),
  };
}
