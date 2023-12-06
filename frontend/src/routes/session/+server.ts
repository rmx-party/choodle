import type { RequestHandler } from "./$types";
import { type Cookies, error, json } from "@sveltejs/kit";
import { upsertUser } from "$lib/server/storage";

const setUserIdCookie = (cookies: Cookies, userId: number) => {
  const TenYearsInSeconds = 60 * 60 * 24 * 365 * 10;
  cookies.set("userId", `${userId}`, {
    httpOnly: true,
    path: "/",
    maxAge: TenYearsInSeconds,
  });
};

export const POST: RequestHandler = async ({ cookies, locals, request }) => {
  const { deviceId } = await request.json();
  let { user } = locals;

  console.log("login data", { deviceId });

  if (user?.id) {
    setUserIdCookie(cookies, user.id);

    return json(user);
  } else if (deviceId) {
    user = await upsertUser({ deviceId });
  }

  if (!user) throw error(400, `login failed`);

  setUserIdCookie(cookies, user.id);

  locals.user = user;

  return json(user);
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
  cookies.delete("userId");
  locals.user = null;

  return json({});
};
