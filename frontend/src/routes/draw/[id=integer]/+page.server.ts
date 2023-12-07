import { cachedReadOnlyClient } from "$lib/CMSUtils";
import { findChallenge } from "$lib/server/storage";
import type { PageServerLoad } from "./$types";
import type { Challenge } from "@prisma/client";
import type { SanityDocument } from "@sanity/client";

const slug = "draw";

export const load: PageServerLoad = async ({ params }) => {
  const pageContent: Promise<SanityDocument> = cachedReadOnlyClient.fetch(
    `*[_type == "pageContent" && pageSlug == $slug][0]`,
    { slug },
  ).catch((error) => {
    console.error(`load failure`, error);
    throw new error(404, `cms load failure for pageContent slug ${slug}`);
  });

  const challenge: Promise<Challenge> = findChallenge({
    id: Number(params.id),
  });

  return { pageContent, challenge };
};
