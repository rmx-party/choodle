import { invalidate, preloadData } from "$app/navigation";
import type { GuessResult } from "@prisma/client";
import { guessPath, pickPath, sharePath } from "./routes";
import { browser } from "$app/environment";

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

export const createSession = async ({ deviceId }: { deviceId: string }) => {
  console.log(`starting user session`, { deviceId });
  const session = await jsonPOST(`/session`, {
    deviceId,
  });
  console.log(`create`, { session });
  return session;
};

export const getMyChallenges = async () => {
  const challenges = await jsonGET(`/challenge`);
  console.log(`get`, { challenges });
  return challenges;
};

export const getMyGuessResults = async () => {
  const guessResults = await jsonGET(`/guess`);
  console.log(`get`, { guessResults });
  return guessResults;
};

export const createChallenge = async (
  { prompt, promptSanityId }: { prompt: string; promptSanityId: string },
) => {
  const challenge = await jsonPOST(`/challenge`, { prompt, promptSanityId });
  preloadData(pickPath(challenge.id));
  console.log(`create`, { challenge });
  return challenge;
};

export const updateChallenge = async (
  { id, ...values },
) => {
  const challenge = await jsonPUT(`/challenge/${id}`, values);
  invalidate(sharePath(challenge.id));
  invalidate(guessPath(challenge.id));
  console.log(`update`, { challenge });
  return challenge;
};

export const createDrawing = async ({ imageUrl }) => {
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
  const guessResult = await jsonPOST(`/guess`, { challengeId });
  console.log(`create`, { guessResult });
  return guessResult;
};

export const updateGuessResult = async (
  { challengeId, guesses, hintsUsed }: GuessResult,
) => {
  const guessResult = await jsonPATCH(`/guess/${challengeId}`, {
    guesses,
    hintsUsed,
  });
  if (browser) {
    invalidate(`/guess`);
    invalidate(guessPath(challengeId));
  }
  console.log(`update`, { guessResult });
  return guessResult;
};
