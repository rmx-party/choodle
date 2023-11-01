import { readOnlyClient } from '$lib/CMSUtils';

export async function load({ params }) {
  const copy = await readOnlyClient.fetch(
    `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`
  );

  if (copy) {
    return { copy: copy };
  }
  return {
    status: 500,
    body: new Error('Internal Server Error'),
  };
}
