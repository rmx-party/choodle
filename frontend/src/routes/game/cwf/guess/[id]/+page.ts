import {readOnlyClient} from "$lib/CMSUtils";
import {loading} from "$lib/store";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`)
  const challenge = await readOnlyClient.fetch(`*[_type == "challenge" && _id == "${params.id}"]{..., challenger->{...}, choodle->{...}, gamePromptRef->{...}} [0]`);

  return {
    copy,
    challenge,
    gamePrompt: challenge.gamePromptRef,
    choodle: challenge.choodle
  };
}
