import { cachedReadOnlyClient, readOnlyClient } from '$lib/CMSUtils';

export async function load({ params }) {
  const challenge = await readOnlyClient.fetch(
    `*[_type == "challenge" && _id == "${params.id}"]{..., challenger->{...}, choodle->{...}, gamePromptRef->{...}} [0]`
  );

  return {
    copy: cachedReadOnlyClient.fetch(
      `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`
    ),
    challenge,
  };
}
