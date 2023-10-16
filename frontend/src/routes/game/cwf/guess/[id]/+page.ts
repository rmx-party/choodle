import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  const copy = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`)
  const challenge = await readOnlyClient.fetch(`*[_type == "challenge" && _id == "${params.id}"]{..., choodle->{...}, gamePromptRef->{...}} [0]`);

  if (challenge) return {copy, challenge: challenge, gamePrompt: challenge.gamePromptRef, choodle: challenge.choodle};

  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
