import { cachedReadOnlyClient } from '$lib/CMSUtils';
import { loading } from '$lib/store';

export async function load({ params }) {
  loading.set(true);

  return {
    copy: cachedReadOnlyClient.fetch(
      `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`
    ),
  };
}
