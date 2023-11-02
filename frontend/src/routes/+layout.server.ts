import {env} from '$env/dynamic/private';
import {cachedReadOnlyClient} from "$lib/CMSUtils";

export function load() {
  return {
    analyticsId: env.VERCEL_ANALYTICS_ID,
    copy: cachedReadOnlyClient.fetch(`*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`),
  }
}
