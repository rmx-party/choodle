import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import {
  createGuessResult,
  getGuessResultsForUser,
  upsertGuessResult,
} from "$lib/server/storage";

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;

  let result = null;

  result = await getGuessResultsForUser({ user });

  if (!result?.length) throw error(404);

  return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const { challengeId } = await request.json();

  const result = await createGuessResult({ challengeId, userId: user.id });
  // TODO: after creating, invalidate the list ISR cache
  // TODO: after creating, invalidate the specific ISR caches

  return json(result);
};

export const PUT: RequestHandler = async ({ locals, request }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const { challengeId, ...values } = await request.json();

  const result = await upsertGuessResult({
    ...values,
    userId: user.id,
    challengeId,
  });

  return json(result);
};
