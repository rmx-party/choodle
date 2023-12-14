import { type GuessResult, PrismaClient, type User } from "@prisma/client";
import find from "lodash/fp/find";
import { error } from "@sveltejs/kit";

export const prisma = new PrismaClient();

export const upsertUser = async (
  { deviceId }: Partial<User> & { deviceId: string },
) => {
  return await prisma.user.upsert({
    where: { deviceId: `${deviceId}` },
    create: {
      deviceId,
    },
    update: {
      deviceId,
    },
  });
};

export const getUserAuthenticators = async (user: User) => {
  return await prisma.fidoAuthenticators.findMany({
    where: { userId: user.id },
  });
};
export const setUserCurrentChallenge = async (
  { user, registrationChallenge }: {
    user: User;
    registrationChallenge: string;
  },
) => {
  return await prisma.user.update({
    where: { id: user.id },
    data: { currentAuthenticationChallenge: registrationChallenge },
  });
};

export const setUserDefaultCategory = async (
  { user, categorySlug }: { user: User; categorySlug: string },
) => {
  const result = await prisma.user.update({
    where: { id: user.id },
    data: { defaultCategorySlug: categorySlug },
  });
  return result;
};

export const getAllChallenges = async () => {
  const challenges = await prisma.challenge.findMany({
    include: { drawing: true, guessResults: true },
  });
  return challenges;
};

export const getChallengesForUser = async ({ user }: { user: User }) => {
  const challenges = await prisma.challenge.findMany({
    where: { userId: user.id },
    include: { drawing: true, guessResults: true },
  });
  return challenges;
};

export const getGuessResultsForUser = async ({ user }: { user: User }) => {
  const guessResults = await prisma.guessResult.findMany({
    where: { userId: user.id },
    include: { challenge: { include: { drawing: true } } },
  });
  return guessResults;
};

export const findChallenge = async (
  { id }: { id: number },
) => {
  const challenge = await prisma.challenge.findUniqueOrThrow({
    where: { id },
    include: { drawing: true },
  }).catch(
    (err) => {
      console.error(`db load failure`, err);
      throw error(404, `database load failure for challenge id ${id}`);
    },
  );
  return challenge;
};

export const createChallenge = async ({ user, ...values }) => {
  const result = await prisma.challenge.create({
    data: { ...values, challenger: { connect: { id: user.id } } },
  });
  return result;
};

export const upsertGuessResult = async (
  { userId, challengeId, id, ...values }: GuessResult,
) => {
  const challenge = await findChallenge({ id: challengeId });

  let resultState = {};
  if (values.guesses) {
    const wasSuccessful = !!find(
      (g) => g.toUpperCase() === challenge.prompt.toUpperCase(),
      values.guesses || [],
    );
    resultState = {
      wasSuccessful,
      final: (values.guesses || []).length >= 3 || wasSuccessful,
    };
  }

  console.log(`upsert guess input`, { userId, challengeId, id, values });
  const result = await prisma.guessResult.upsert({
    where: { challengeId_userId: { challengeId, userId } },
    update: { ...values, ...resultState },
    create: {
      ...values,
      ...resultState,
      challenge: { connect: { id: challengeId } },
      guesser: { connect: { id: userId } },
    },
  });
  console.log(`upsert guess result`, { result });
  return result;
};

export const createGuessResult = async ({ user, ...values }) => {
  const result = await prisma.guessResult.create({
    data: { ...values, guesser: { connect: { id: user.id } } },
  });
  return result;
};
