import { PUBLIC_ISR_BYPASS_TOKEN } from "$env/static/public";
import { readOnlyClient } from "$lib/CMSUtils";

export const config = {
  isr: {
    expiration: 600,
    bypassToken: PUBLIC_ISR_BYPASS_TOKEN,
  },
};

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
