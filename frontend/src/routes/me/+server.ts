import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { setUserDefaultCategory } from "$lib/server/storage";

export const PATCH: RequestHandler = async ({ locals, request }) => {
  const { categorySlug } = await request.json();
  const { user } = locals;

  const updated = await setUserDefaultCategory({ user, categorySlug });

  return json(updated);
};
