import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const { imageUrl } = await request.json();

  const result = await prisma.drawing.create({
    data: { imageUrl, userId: user.id },
  });
  // TODO: after creating a challenge, invalidate the challenge list ISR cache
  // TODO: after creating a challenge, invalidate the challenge specific ISR caches

  return json(result);
};
