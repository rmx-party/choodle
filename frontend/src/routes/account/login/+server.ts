import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { error, json } from "@sveltejs/kit";
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

export const GET: RequestHandler = async ({ locals }) => {
  // Get logged in user
  const { user } = locals;

  // Get user's registered authenticators
  const authenticators = await getUserAuthenticators(user);

  // Generate auth options
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

  // Save challenge
  locals.user = await setUserCurrentChallenge({
    user,
    challenge: options.challenge,
  });

  return json(options);
};

// routes/auth.js
export const POST: RequestHandler = async ({ request, locals }) => {
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
  if (!expectedChallenge) {
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
    throw error(400, "Auth failed");
  }

  const { authenticationInfo } = result;
  const { newCounter } = authenticationInfo;

  saveUpdatedAuthenticatorCounter({ authenticator, newCounter });
  setUserCurrentChallenge({ user, challenge: "" });

  return json(result);
  // WIP TODO

  // Merge anonymous session data
  mergeAnonAccount(result.userHandle);

  // update the request locals
  locals.user = user.reload();

  return json({ success: true });
};
