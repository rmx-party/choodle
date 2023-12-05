import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  const { user } = locals;
  if (!user) throw error(401);
  const { id } = params;

  const data = await request.json();

  // TODO: look up the challenge by id and update it
  const result = await prisma.challenge.update({
    where: { id: Number(id), userId: user.id },
    data,
  });
  // TODO: when challenges change, invalidate relevant ISR caches

  // TODO: 404 if no challenge found
  // TODO: 403 if user is not the challenge owner
  // TODO: 400 if challenge is already complete
  return json(result);
};
