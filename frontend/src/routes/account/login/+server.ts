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
  setUserAuthenticatedState,
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

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = locals; // TODO: might want to let the client send a user id / handle to get their authenticators
  let allowCredentials: PublicKeyCredentialDescriptorFuture[] | undefined;
  let authenticators: FidoAuthenticator[] | undefined = undefined;

  // at this point, if we have a user from locals, they should be an anonymous user.
  // for someone with existing credentials, we should have a way to locate them by their credentials
  // which can be populated client side

  if (user?.id) {
    authenticators = await getUserAuthenticators(user);
  }

  if (authenticators?.length) {
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

  let user = authenticator.user;
  const sessionUser = locals.user;
  const expectedChallenge = sessionUser.currentAuthenticationChallenge;

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
  user = await setUserAuthenticatedState(user);

  setUserIdCookie(cookies, user.id);
  locals.user = user; // TODO: ensure this user data is consistent with db if it matters
  return json({ ...result, user });
  // WIP TODO

  // Merge anonymous session data
  // mergeAnonAccount(result.userHandle);
};
