import { env } from "$env/dynamic/private";
import { cachedReadOnlyClient } from "$lib/CMSUtils";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
  return {
    analyticsId: env.VERCEL_ANALYTICS_ID,
    copy: cachedReadOnlyClient.fetch(
      `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`,
    ),
  };
};
