import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { type Cookies, error, json } from "@sveltejs/kit";
import {
  getUserAuthenticator,
  getUserAuthenticators,
  saveUpdatedAuthenticatorCounter,
  setUserCurrentChallenge,
} from "$lib/server/storage";
import {
  origin,
  rpID,
  rpName,
  userVerification,
} from "$lib/server/authentication";
import type { RequestHandler } from "./$types";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/typescript-types";

const setUserIdCookie = (cookies: Cookies, userId: number) => {
  const TenYearsInSeconds = 60 * 60 * 24 * 365 * 10;
  cookies.set("userId", `${userId}`, {
    secure: true,
    httpOnly: true,
    path: "/",
    maxAge: TenYearsInSeconds,
  });
};

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals;

  const authenticators = await getUserAuthenticators(user);

  if (!authenticators.length) throw error(400, "No authenticators found");

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification,
    ...{
      allowCredentials: authenticators.map((auth) => ({
        id: Buffer.from(auth.credentialID, "base64"),
        type: "public-key",
        transports: auth.transports as AuthenticatorTransportFuture[],
      })),
    },
  });

  await setUserCurrentChallenge({
    user,
    challenge: options.challenge,
  });

  return json(options);
};

export const POST: RequestHandler = async ({ cookies, request, locals }) => {
  const { user } = locals;

  const authenticatorResponse = await request.json();

  const authenticator = await getUserAuthenticator(
    {
      user,
      credentialID: authenticatorResponse.id,
    },
  );
  const expectedChallenge = user.currentAuthenticationChallenge;

  console.log({
    user,
    authenticatorResponse,
    authenticator,
    expectedChallenge,
  });

  if (!authenticator) {
    throw error(400, "Authenticator not found");
  }
  if (!expectedChallenge?.length) {
    throw error(400, "Challenge not found");
  }

  // Verify credential
  const result = await verifyAuthenticationResponse({
    response: authenticatorResponse,
    authenticator,
    expectedChallenge,
    expectedRPID: rpID,
    expectedOrigin: origin,
    requireUserVerification: false,
  });

  if (!result.verified) {
    cookies.delete("userId");
    locals.user = null;
    throw error(400, "Auth failed");
  }

  const { authenticationInfo } = result;
  const { newCounter } = authenticationInfo;

  saveUpdatedAuthenticatorCounter({ authenticator, newCounter });
  setUserCurrentChallenge({ user, challenge: "" });

  setUserIdCookie(cookies, user.id);
  locals.user = user; // TODO: ensure this user data is consistent with db if it matters
  return json(result);
  // WIP TODO

  // Merge anonymous session data
  // mergeAnonAccount(result.userHandle);

  // update the request locals

  return json({ success: true });
};
