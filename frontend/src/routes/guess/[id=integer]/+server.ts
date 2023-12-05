import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export const PATCH: RequestHandler = async ({ request, locals, params }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const { id } = params;
  const values = await request.json(); // TODO: sanitize assignable values

  console.log("update guess result", { id, values });
  const result = await prisma.guessResult.update({
    where: { id: Number(id), userId: user.id },
    data: { ...values, userId: user.id },
  });
  console.log("updated guess result", { result });
  return json(result);
};
