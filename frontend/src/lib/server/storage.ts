import { PrismaClient, type User } from "@prisma/client";
import { error } from "@sveltejs/kit";

export const prisma = new PrismaClient();

export const getAllChallenges = async () => {
  const challenges = await prisma.challenge.findMany({
    include: { drawing: true, guessResults: true },
  }).catch(
    (err) => {
      console.error(`db load failure`, err);
      throw error(404, `database load failure`);
    },
  );
  return challenges;
};

export const getChallengesForUser = async ({ user }: { user: User }) => {
  const challenges = await prisma.challenge.findMany({
    where: { userId: user.id },
    include: { drawing: true, guessResults: true },
  }).catch(
    (err) => {
      console.error(`db load failure`, err);
      throw error(404, `database load failure`);
    },
  );
  return challenges;
};

export const getGuessResultsForUser = async ({ user }: { user: User }) => {
  const guessResults = await prisma.guessResult.findMany({
    where: { userId: user.id },
    include: { challenge: { include: { drawing: true } } },
  }).catch(
    (err) => {
      console.error(`db load failure`, err);
      throw error(404, `database load failure`);
    },
  );
  return guessResults;
};

export const findChallenge = async (
  { id }: { id: number },
) => {
  const challenge = await prisma.challenge.findUnique({
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
    data: { ...values, user: { connect: { id: user.id } } },
  });
  return result;
};

export const upsertGuessResult = async ({ userId, challengeId, ...values }) => {
  const result = await prisma.guessResult.upsert({
    where: { challengeId_userId: { challengeId, userId } },
    update: { ...values },
    create: {
      ...values,
      challenge: { connect: { id: challengeId } },
      guesser: { connect: { id: userId } },
    },
  });
  return result;
};

export const createGuessResult = async ({ user, ...values }) => {
  const result = await prisma.guessResult.create({
    data: { ...values, guesser: { connect: { id: user.id } } },
  });
  return result;
};
