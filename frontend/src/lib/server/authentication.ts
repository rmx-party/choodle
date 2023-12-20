import pick from "lodash/fp/pick";

import {
  PUBLIC_PASSKEY_APP_ID,
  PUBLIC_PASSKEY_APP_NAME,
  PUBLIC_PASSKEY_ORIGIN,
} from "$env/static/public";
import type {
  CredentialDeviceType,
  UserVerificationRequirement,
} from "@simplewebauthn/typescript-types";
import type { FidoAuthenticator } from "@prisma/client";
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { Cookies } from "@sveltejs/kit";

// Human-readable title for your website
export const rpName = PUBLIC_PASSKEY_APP_NAME;
// A unique identifier for your website
export const rpID = PUBLIC_PASSKEY_APP_ID;
// The URL at which registrations and authentications should occur
export const origin = PUBLIC_PASSKEY_ORIGIN;

export const residentKey: ResidentKeyRequirement = "preferred";
export const userVerification: UserVerificationRequirement = "discouraged";

// if origin is not secure, throw a warning
if (!origin.startsWith("https://")) {
  console.warn(
    `SimpleWebAuthnServer initializing with INSECURE ORIGIN: ${rpName} ${rpID} ${origin}`,
  );
} else {
  console.log(`SimpleWebAuthnServer initializing: ${rpName} ${rpID} ${origin}`);
}

export const setUserIdCookie = (cookies: Cookies, userId: number) => {
  const TenYearsInSeconds = 60 * 60 * 24 * 365 * 10;
  cookies.set("userId", `${userId}`, {
    secure: true,
    httpOnly: true,
    path: "/",
    maxAge: TenYearsInSeconds,
  });
};

export type FidoAuthenticatorRaw = {
  // SQL: Encode to base64url then store as `TEXT`. Index this column
  credentialID: Uint8Array;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  credentialPublicKey: Uint8Array;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  credentialDeviceType: CredentialDeviceType;
  // SQL: `BOOL` or whatever similar type is supported
  credentialBackedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransport[];
};

export const serializeAuthenticator = (
  authenticator:
    | FidoAuthenticator
    | FidoAuthenticatorRaw
    | VerifiedRegistrationResponse["registrationInfo"],
) => {
  if (!authenticator) return null;
  let credentialID: string | undefined;
  let credentialPublicKey: string | undefined;

  if (authenticator.credentialID) {
    credentialID = Buffer.from(authenticator.credentialID).toString(
      "base64url",
    );
  }
  if (authenticator.credentialPublicKey) {
    credentialPublicKey = Buffer.from(authenticator.credentialPublicKey)
      .toString("base64url");
  }

  const newAuthenticator = {
    ...pick(
      [
        "credentialID",
        "credentialPublicKey",
        "counter",
        "credentialDeviceType",
        "credentialBackedUp",
        "createdAt",
        "updatedAt",
      ],
      authenticator,
    ),
    ...{
      credentialID,
      credentialPublicKey,
    },
  };
  return newAuthenticator;
};
