import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { upsertUser } from "$lib/server/storage";

export const POST: RequestHandler = async ({ cookies, locals, request }) => {
  const { deviceId } = await request.json();
  let { user } = locals;
  const TenYearsInSeconds = 60 * 60 * 24 * 365 * 10;

  console.log("login data", { deviceId });

  if (user?.id) {
    cookies.set("userId", `${user.id}`, {
      httpOnly: true,
      path: "/",
      maxAge: TenYearsInSeconds,
    });
    return json(user);
  } else if (deviceId) {
    user = await upsertUser({ deviceId });
  }

  if (!user) throw error(400, `login failed`);

  cookies.set("userId", `${user.id}`, {
    httpOnly: true,
    path: "/",
    maxAge: TenYearsInSeconds,
  });

  locals.user = user;

  return json(user);
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
  cookies.delete("userId");
  locals.user = null;

  return json({});
};
