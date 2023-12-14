import { randomUUID } from "crypto";
import { json } from "@sveltejs/kit";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import {
  getUserAuthenticators,
  setUserCurrentChallenge,
  upsertUser,
} from "$lib/server/storage";
import { origin, rpID, rpName } from "$lib/server/authentication";
import type { RequestHandler } from "./$types";
import type { User } from "@prisma/client";

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
    attestationType: "none",
    excludeCredentials: authenticators.map((auth) => ({
      id: auth.credentialID,
      type: "public-key",
      transports: auth.transports,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });

  // Save challenge
  setUserCurrentChallenge({ user, registrationChallenge: options.challenge });

  return json(options);
};
