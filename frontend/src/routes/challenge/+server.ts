import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { getChallengesForUser } from "$lib/server/storage";

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const result = await getChallengesForUser({ user });

  return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const { prompt, promptSanityId } = await request.json();

  const result = await prisma.challenge.create({
    data: { prompt, promptSanityId, userId: user.id },
  });
  // TODO: after creating a challenge, invalidate the challenge list ISR cache
  // TODO: after creating a challenge, invalidate the challenge specific ISR caches

  return json(result);
};
