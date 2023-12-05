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

export const createSession = async ({ sanityId, deviceId }) => {
  console.log(`starting user session`, { sanityId, deviceId });
  const session = await jsonPOST(`/session?/create`, {
    sanityId,
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
  console.log(`create`, { challenge });
  return challenge;
};

export const updateChallenge = async (
  { id, ...values },
) => {
  const challenge = await jsonPUT(`/challenge/${id}`, values);
  console.log(`update`, { challenge });
  return challenge;
};

export const createDrawing = async ({ imageUrl }) => {
  // TODO: use sanity upload urls to create drawing
  const drawing = await jsonPOST(`/drawing`, { imageUrl });
  console.log(`create`, { drawing });
  return drawing;
};

export const findOrCreateGuessResult = async (
  { challengeId }: { challengeId: number },
) => {
  const guessResult = await jsonPUT(`/guess`, { challengeId });
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
  { id, guesses, hintsUsed, guessedCorrectly, final }: {
    id: number;
    guesses: string[];
    hintsUsed: string[];
    guessedCorrectly: boolean | null;
    final: boolean;
  },
) => {
  const guessResult = await jsonPATCH(`/guess/${id}`, {
    guesses,
    hintsUsed,
    guessedCorrectly,
    final,
  });
  console.log(`update`, { guessResult });
  return guessResult;
};
