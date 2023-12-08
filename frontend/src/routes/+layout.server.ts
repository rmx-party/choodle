import { cachedReadOnlyClient } from "$lib/CMSUtils";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    copy: cachedReadOnlyClient.fetch(
      `*[_type == "choodleWithFriendsCopy"] | order(_createdAt) [0]`,
    ),
    user: locals.user,
  };
};
