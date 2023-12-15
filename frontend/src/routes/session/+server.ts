import { type Cookies, error, json, redirect } from "@sveltejs/kit";
import { getUserByDeviceId, upsertUser } from "$lib/server/storage";
import type { RequestHandler } from "./$types";

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
  console.log("login data", { deviceId, user });

  if (user?.id) return json(user); // already logged in, do nothing

  // TODO: we should try to lose this constraint when possible.
  // deviceId comes from browser local storage, and isn't recoverable
  if (!deviceId) throw error(400, `login failed, deviceId required`);

  const requestedUser = await getUserByDeviceId(deviceId);

  if (requestedUser) {
    // TODO: check if passkey authentication is required or not

    if (requestedUser.fidoAuthenticators.length) {
      // TODO: authentication should be required, delegate to /account/login and return
      return redirect("/account/login");
    }

    user = requestedUser;
  } else {
    // this user doesn't exist, so we want to create their anonymous account
    user = await upsertUser({ deviceId });
  }

  if (!user) throw error(400, `login failed`);

  // if you get here, you're logged in

  setUserIdCookie(cookies, user.id);
  locals.user = user;

  return json(user);
};

export const DELETE: RequestHandler = async ({ cookies, locals }) => {
  cookies.delete("userId");
  locals.user = null;

  return json({ success: true });
};
