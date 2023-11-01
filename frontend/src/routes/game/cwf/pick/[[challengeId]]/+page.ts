import { cachedReadOnlyClient, readOnlyClient } from '$lib/CMSUtils';
import fp from 'lodash/fp.js';

export async function load({ params }) {
  return {
    copy: cachedReadOnlyClient.fetch(
      `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`
    ),
    records: fp.shuffle(await cachedReadOnlyClient.fetch(`*[_type == "gamePrompt"]`)),
  };
}
