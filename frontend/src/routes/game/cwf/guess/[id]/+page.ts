import {readOnlyClient} from "$lib/CMSUtils";

export async function load({params}) {
  const copyPromise = await readOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`)
  const challengePromise = await readOnlyClient.fetch(`*[_type == "challenge" && _id == "${params.id}"]{..., choodle->{...}, gamePromptRef->{...}} [0]`);

  const [copy, challenge] = await Promise.all([copyPromise, challengePromise])

  if (challenge && copy) return {copy, challenge, gamePrompt: challenge.gamePromptRef, choodle: challenge.choodle};

  return {
    status: 500,
    body: new Error("Internal Server Error")
  };
}
