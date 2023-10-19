import {readOnlyClient} from "$lib/CMSUtils";
import { loading } from "$lib/store";

export async function load({params}) {
  loading.set(true)
  const copy = readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`)
  const challenge = readOnlyClient.fetch(`*[_type == "challenge" && _id == "${params.id}"]{..., challenger->{...}, choodle->{...}, gamePromptRef->{...}} [0]`);

  return {
    copy,
    challenge,
    gamePrompt: (await challenge).gamePromptRef,
    choodle: (await challenge).choodle
  };
}
