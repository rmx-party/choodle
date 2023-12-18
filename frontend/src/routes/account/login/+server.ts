import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { type Cookies, error, json } from "@sveltejs/kit";
import {
  createUser,
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
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialDescriptorFuture,
} from "@simplewebauthn/typescript-types";
import type { FidoAuthenticator } from "@prisma/client";

const setUserIdCookie = (cookies: Cookies, userId: number) => {
  const TenYearsInSeconds = 60 * 60 * 24 * 365 * 10;
  cookies.set("userId", `${userId}`, {
    secure: true,
    httpOnly: true,
    path: "/",
    maxAge: TenYearsInSeconds,
  });
};

export const GET: RequestHandler = async ({ cookies, locals }) => {
  let { user } = locals;
  let allowCredentials: PublicKeyCredentialDescriptorFuture[] | undefined;
  let authenticators: FidoAuthenticator[] | undefined;

  if (!user?.id) { // TODO: Maybe this belongs in a separate  endpoint
    user = await createUser({});
    locals.user = user;
    setUserIdCookie(cookies, user.id);
    return json(user);
  }

  // at this point, if we have a user from locals, they should be an anonymous user.
  // for someone with existing credentials, we should have a way to locate them by their credentials
  // which can be populated client side

  authenticators = await getUserAuthenticators(user);

  if (authenticators.length) {
    allowCredentials = authenticators.map((auth) => ({
      id: Buffer.from(auth.credentialID, "base64"),
      type: "public-key",
      transports: auth.transports as AuthenticatorTransportFuture[],
    }));
  }

  const authenticationOptions = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification,
  });

  await setUserCurrentChallenge({
    user,
    challenge: authenticationOptions.challenge,
  });

  return json(authenticationOptions);
};

export const POST: RequestHandler = async ({ cookies, request, locals }) => {
  const authenticatorResponse: AuthenticationResponseJSON = await request
    .json();

  console.log({ authenticatorResponse });

  const authenticator = await getUserAuthenticator(
    {
      credentialID: authenticatorResponse.id,
    },
  );

  if (!authenticator?.user) throw error(400, "Authenticator not found");

  const user = authenticator.user;
  const expectedChallenge = user.currentAuthenticationChallenge;

  // TODO: there's an issue here when we want to transition from anonymous session
  // to a registered user. the challenge being responded to is from a
  // separate account from the stored authenticator
  // we strongly associate a user with a passkey, but we don't have a way to
  // strongly ensure that the requested challenge is valid for the user.
  // storing challenge in the authenticator won't work because we are sending it to the client
  // before the account/device is identified.
  // maybe it's acceptable to store pending challenges in their own table or ephemeral data store,
  // rather than associating them with a user or device.
  //
  // the lib suggests putting challenges in redis by 'sessionId' which identifies a session cookie generated
  // at page load time, without any database association.
  // we still want to associate anon sessions with their data, so maybe this is a separate cookie from the user id cookie.
  // or maybe we keep using the user id, and locate the anon account challenge from that, and treat it as valid
  // for any other account, just one time use. this might allow weird race conditions across accounts active on multiple devices

  console.log({
    user,
    authenticatorResponse,
    authenticator,
    expectedChallenge,
  });

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
    throw error(401, "Authentication failed");
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
};
