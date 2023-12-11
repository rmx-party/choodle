import { cachedReadOnlyClient } from "$lib/CMSUtils";
import { error, redirect } from "@sveltejs/kit";
import shuffle from "lodash/fp/shuffle";

import type { PageServerLoad } from "./$types";
import type { SanityDocument } from "@sanity/client";
import type { Challenge } from "@prisma/client";
import { pickPath } from "$lib/routes";
import { createChallenge } from "$lib/server/storage";
import type { StreakGuessingGamePrompt } from "$lib/CWFGame";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { category } = params;
  const { user } = locals;
  let challenge: Challenge | null = null;
  let selectedCategory: SanityDocument | undefined;

  if (!user) {
    throw error(401, `unauthorized`);
  }

  const categories: SanityDocument[] = await cachedReadOnlyClient.fetch(
    `*[_type == "promptCategory"]`,
  ).catch((err) => {
    console.error(`load failure`, err);
    throw error(404, `cms load failure for promptCategory records`);
  });
  const gamePrompts: StreakGuessingGamePrompt[] = await cachedReadOnlyClient
    .fetch(
      `*[_type == "gamePrompt"]{..., category->{...}}`,
    ).catch(
      (err) => {
        console.error(`load failure`, err);
        throw error(404, `cms load failure for gamePrompt records`);
      },
    );

  // TODO: selectable categories are ones that have prompts referencing them
  const selectableCategories = categories.filter((c) =>
    gamePrompts.find((p) => p.category?._id === c._id)
  );

  if (category) {
    selectedCategory = selectableCategories.find((c) => c.slug === category);
  }

  if (!selectedCategory) {
    selectedCategory = shuffle(selectableCategories)[0];
  }

  // TODO: select a random prompt that references the category
  const selectedPrompt = gamePrompts.find((p) =>
    p.category?._id === selectedCategory?._id
  );

  // TODO: once a category is loaded, create challenge with random prompt from category and redirect user to it

  challenge = await createChallenge({
    user,
    promptSanityId: selectedPrompt?._id,
    prompt: selectedPrompt?.prompt,
  });

  throw redirect(301, pickPath(challenge.id));
};
