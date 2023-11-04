import { readOnlyClient } from "$lib/CMSUtils";

export async function load({ params }) {
  const challenge = await readOnlyClient.fetch(
    `*[_type == "challenge" && _id == "${params.id}"]{..., challenger->{...}, choodle->{...}, gamePromptRef->{...}} [0]`,
  );

  return {
    challenge,
    gamePrompt: challenge.gamePromptRef,
    choodle: challenge.choodle,
  };
}
