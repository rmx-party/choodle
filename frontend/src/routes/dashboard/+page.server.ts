import { cachedReadOnlyClient } from "$lib/CMSUtils";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const slug = `dashboard`;

export const load: PageServerLoad = async () => {
  const pageContent = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for pageContent slug ${slug}`);
  });

  return {
    pageContent,
  };
};
