import { browser } from "$app/environment";
import { goto, invalidate, preloadData } from "$app/navigation";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { guessPath, pickPath, sharePath } from "./routes";
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types";
import type { GuessResult } from "@prisma/client";

type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export const jsonFetch = async (
  { url, method, data }: { url: string; method: HTTPMethod; data: any },
) => {
  let body = null;
  if (data) {
    body = JSON.stringify(data);
  }
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...{ body },
  });
  return response.json();
};

export const jsonGET = async (url: string) => {
  return jsonFetch({ url, method: "GET", data: null });
};

export const jsonPUT = async (url: string, data: any) => {
  return jsonFetch({ url, method: "PUT", data });
};

export const jsonPATCH = async (url: string, data: any) => {
  return jsonFetch({ url, method: "PATCH", data });
};

export const jsonPOST = async (url: string, data: any) => {
  return jsonFetch({ url, method: "POST", data });
};

export const jsonDELETE = async (url: string, data: any) => {
  return jsonFetch({ url, method: "DELETE", data });
};

export const createAnonymousSession = async () => {
  if (!browser) return;
  console.log(`starting anonymous user session`);
  const session = await jsonGET(`/account/login`);
  console.log(`create`, { session });
  return session;
};

export const endSession = async () => {
  const response = await jsonDELETE(`/session`, { logout: true });
  const { success } = response;

  if (!success) throw new Error(`error logging out`);
};

export const createPasskeySession = async () => {
  if (!browser) return;

  // TODO: determine whether we need a loading indicator during this process
  const authenticationOptions = await jsonGET("/account/login");
  console.log({ authenticationOptions });

  let authenticatorResponse: undefined | AuthenticationResponseJSON;
  const useBrowserAutofill = false;
  try {
    if (!authenticationOptions?.challenge?.length) {
      throw new Error(`no challenge found`);
    }

    // if (authenticationOptions?.allowCredentials?.length) {
    //   useBrowserAutofill = true; // Only usable when we have a username input to trigger autofill
    // }

    authenticatorResponse = await startAuthentication(
      authenticationOptions,
      useBrowserAutofill,
    );
    // TODO: report event to GA
  } catch (err) {
    console.warn(`error registering`, err);
    // TODO: report event to GA
  }
  console.log({ authenticatorResponse });

  if (!authenticatorResponse) return;

  const verificationJSON: undefined | Record<string, unknown> = await jsonPOST(
    "/account/login",
    authenticatorResponse,
  );

  console.log({ verificationJSON });

  // Show UI appropriate for the `verified` status
  if (verificationJSON && verificationJSON.verified && verificationJSON.user) {
    return verificationJSON.user;
  } else {
    // TODO: decide how to handle login failure modes
  }
};

export const createPasskeyRegistration = async () => {
  if (!browser) return;
  let registrationDetails: RegistrationResponseJSON | undefined = undefined;

  const registrationOptions: PublicKeyCredentialCreationOptionsJSON =
    await jsonGET("/account/registration");

  try {
    registrationDetails = await startRegistration(registrationOptions);
    console.log({ registrationDetails });
    // TODO: report event to GA
  } catch (err) {
    console.warn(`error registering`, err);
    // TODO: fail gracefully
    // TODO: try to select user cancellation vs timeout vs other errors
    // TODO: report event to GA
    throw err;
  }

  if (!registrationDetails) throw new Error(`error registering`);

  const verificationJSON = await jsonPOST(
    "/account/registration",
    registrationDetails,
  );

  // Wait for the results of verification
  console.log({ verificationJSON });
  return verificationJSON;
};

export const updateMyCategory = async ({ slug }: { slug: string }) => {
  if (!browser) return;

  const user = await jsonPATCH(`/me`, {
    categorySlug: slug,
  });
  console.log(`update`, { user });
  return user;
};

export const getMyChallenges = async () => {
  if (!browser) return;
  const challenges = await jsonGET(`/challenge`);
  console.log(`get`, { challenges });
  return challenges;
};

export const getMyGuessResults = async () => {
  if (!browser) return;
  const guessResults = await jsonGET(`/guess`);
  console.log(`get`, { guessResults });
  return guessResults;
};

export const createChallenge = async (
  { prompt, promptSanityId }: { prompt: string; promptSanityId: string },
) => {
  if (!browser) return;
  const challenge = await jsonPOST(`/challenge`, { prompt, promptSanityId });
  preloadData(pickPath(challenge.id));
  console.log(`create`, { challenge });
  return challenge;
};

export const updateChallenge = async (
  { id, ...values },
) => {
  if (!browser) return;
  const challenge = await jsonPUT(`/challenge/${id}`, values);
  if (browser) {
    invalidate(sharePath(challenge.id));
    invalidate(guessPath(challenge.id));
  }
  console.log(`update`, { challenge });
  return challenge;
};

export const createDrawing = async ({ imageUrl }) => {
  if (!browser) return;
  const drawing = await jsonPOST(`/drawing`, { imageUrl });
  console.log(`create`, { drawing });
  return drawing;
};

export const findOrCreateGuessResult = async (
  { challengeId }: { challengeId: number },
) => {
  if (!browser) return;
  const guessResult = await jsonPUT(`/guess`, { challengeId }); // TODO: this should be realtive to challenge id url, and uses user cookie to determine whose guess
  invalidate(`/guess`);
  invalidate(guessPath(challengeId));
  console.log(`find or create`, { guessResult });
  return guessResult;
};

export const createGuessResult = async (
  { challengeId }: { challengeId: number },
) => {
  if (!browser) return;
  const guessResult = await jsonPOST(`/guess`, { challengeId });
  console.log(`create`, { guessResult });
  return guessResult;
};

export const updateGuessResult = async (
  { challengeId, guesses, hintsUsed }: GuessResult,
) => {
  if (!browser) return;
  const guessResult = await jsonPATCH(`/guess/${challengeId}`, {
    guesses,
    hintsUsed,
  });
  invalidate(`/guess`);
  invalidate(guessPath(challengeId));
  console.log(`update`, { guessResult });
  return guessResult;
};
