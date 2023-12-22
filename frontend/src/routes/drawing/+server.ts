import { error, json } from "@sveltejs/kit";
import { createDrawing } from "$lib/server/storage";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const { imageUrl } = await request.json();

  const result = await createDrawing({ user, imageUrl });

  return json(result);
};
