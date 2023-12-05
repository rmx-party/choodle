import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { upsertGuessResult } from "$lib/server/storage";

export const config = {
  isr: false,
};

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const { id } = params;
  const values = await request.json(); // TODO: sanitize assignable values

  console.log("update guess result", { id, values });
  const result = await upsertGuessResult({
    ...values,
    userId: user.id,
    challengeId: Number(id),
  });
  console.log("updated guess result", { result });
  return json(result);
};
