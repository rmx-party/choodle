import { randomUUID } from "crypto";
import pick from "lodash/fp/pick";
import { error, json } from "@sveltejs/kit";
import {
  generateRegistrationOptions,
  type VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {
  origin,
  residentKey,
  rpID,
  rpName,
  userVerification,
} from "$lib/server/authentication";
import {
  addUserAuthenticator,
  getUserAuthenticators,
  setUserCurrentChallenge,
  upsertUser,
} from "$lib/server/storage";
import type { FidoAuthenticator, User } from "@prisma/client";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  let user: User | undefined;
  user = locals.user;
  let { deviceId } = params; // TODO: add support for optional deviceId param

  if (!user) {
    deviceId ||= randomUUID();
    user = await upsertUser({
      deviceId,
    });
    locals.user = user;

    // TODO: also set session cookie?
  }

  // Get user's existing authenticators
  const authenticators: FidoAuthenticator[] = await getUserAuthenticators(user);

  // Generate registration options
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: `${user.id}`,
    userName: `Choodle account ${user.deviceId}`,
    userDisplayName: `Choodle account ${user.deviceId}`, // TODO: figure out where these appear and offer user customization
    attestationType: "none",
    excludeCredentials: authenticators.map((auth) => ({
      id: auth.credentialID,
      type: "public-key",
      transports: auth.transports,
    })),
    authenticatorSelection: {
      residentKey,
      userVerification,
    },
  });

  // Save challenge
  setUserCurrentChallenge({ user, challenge: options.challenge });

  return json(options);
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
  const { deviceId } = params;
  const body = await request.json();
  let { user } = locals;

  if (!user) {
    throw error(400, "Registration failed, no user session");
  }

  const expectedChallenge = user.currentAuthenticationChallenge;

  if (!expectedChallenge?.length) {
    throw error(400, "Registration failed, no challenge expected");
  }

  const verification: VerifiedRegistrationResponse =
    await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    }).catch((err) => {
      console.error(err);
      throw error(400, "Registration failed");
    });

  const { verified } = verification;
  if (!verified || !verification?.registrationInfo) {
    throw error(400, "Registration failed");
  }

  const { registrationInfo } = verification;

  const newAuthenticator = {
    ...pick(
      [
        "credentialID",
        "credentialPublicKey",
        "counter",
        "credentialDeviceType",
        "credentialBackedUp",
      ],
      registrationInfo,
    ),
    credentialID: Buffer.from(registrationInfo.credentialID).toString(
      "base64url",
    ),
  };

  await addUserAuthenticator({ user, ...newAuthenticator });
  setUserCurrentChallenge({ user, challenge: "" });

  return json({ success: true });
};
