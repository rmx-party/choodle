import { VERCEL_ANALYTICS_ID } from "$env/static/private";
import { cachedReadOnlyClient } from "$lib/CMSUtils";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    analyticsId: VERCEL_ANALYTICS_ID,
    copy: cachedReadOnlyClient.fetch(
      `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`,
    ),
    user: locals.user,
  };
};
