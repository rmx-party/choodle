import { randomUUID } from "crypto";
import pick from "lodash/fp/pick";
import { error, json } from "@sveltejs/kit";
import {
  generateRegistrationOptions,
  type VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { origin, rpID, rpName } from "$lib/server/authentication";
import {
  addUserAuthenticator,
  getUserAuthenticators,
  getUserCurrentChallenge,
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
  }

  // Get user's existing authenticators
  const authenticators = await getUserAuthenticators(user);

  // Generate registration options
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: `${user.id}`,
    userName: user.deviceId,
    userDisplayName: `Choodle account ${user.deviceId}`,
    attestationType: "none",
    excludeCredentials: authenticators.map((auth) => ({
      id: auth.credentialID,
      type: "public-key",
      transports: auth.transports,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "discouraged",
    },
  });

  // Save challenge
  setUserCurrentChallenge({ user, registrationChallenge: options.challenge });

  return json(options);
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
  const { deviceId } = params;
  const body = await request.json();
  let { user } = locals;

  if (!user) {
    user = await upsertUser({ deviceId });
  }

  const expectedChallenge = await getUserCurrentChallenge(user);

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

  // (Pseudocode) Save the authenticator info so that we can
  // get it by user ID later
  await addUserAuthenticator({ user, ...newAuthenticator });

  return json({ success: true });
};
