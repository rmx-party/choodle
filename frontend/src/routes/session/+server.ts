import { PrismaClient } from "@prisma/client";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ cookies, request }) => {
  const { deviceId } = await request.json();

  let user = null;
  console.log("login data", { deviceId });
  if (deviceId) {
    user = await prisma.user.findFirst({
      where: { deviceIds: { has: `${deviceId}` } },
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        deviceIds: [deviceId],
      },
    });
  }

  if (!user) throw error(400, `login failed`);

  const TenYearsInSeconds = 60 * 60 * 24 * 365 * 10;
  cookies.set("userId", `${user.id}`, {
    httpOnly: true,
    path: "/",
    maxAge: TenYearsInSeconds,
  });

  return json(user);
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
  cookies.delete("userId");
  locals.user = null;

  return json({});
};
