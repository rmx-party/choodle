import { goto, invalidate, preloadData } from "$app/navigation";
import type { GuessResult } from "@prisma/client";
import { guessPath, pickPath, sharePath } from "./routes";
import { browser } from "$app/environment";
import localforage from "localforage";

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
  const { success } = await response.json();

  if (!success) throw new Error(`error logging out`);
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
