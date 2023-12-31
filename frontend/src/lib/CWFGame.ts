import any from "lodash/fp/any";
import map from "lodash/fp/map";
import filter from "lodash/fp/filter";
import find from "lodash/fp/find";

export type NormalizedCWFGame = {
  player1: string;
  player2: string;
  guessResults: boolean[];
};

export const isNormalizedGameComplete = (guessResults: boolean[]) => {
  return any((guess) => guess === false, guessResults);
};

export const normalizeGame = (game): NormalizedCWFGame => {
  const normalizedGame = createCWFGame(game?.player1?._id, game?.player2?._id);
  return {
    ...game,
    ...normalizedGame,
    guessResults: map(
      (result) => {
        if ([true, false].includes(result)) return result;
        return result.guessedCorrectly;
      },
      [...game.guessResults],
    ),
  };
};

export const createCWFGame = (player1Id, player2Id): NormalizedCWFGame => {
  return {
    player1: player1Id,
    player2: player2Id,
    guessResults: [],
  };
};

export const addGuessToGame = (
  game: NormalizedCWFGame,
  guessResult: boolean,
): NormalizedCWFGame => {
  return {
    ...game,
    guessResults: [...game.guessResults, guessResult],
  };
};

export const isGameComplete = (game): boolean => {
  if (!game) return false;
  if (!game.guessResults) return false;
  return isNormalizedGameComplete(normalizeGame(game).guessResults);
};

export const normalizedGameStreakCount = (game: NormalizedCWFGame) => {
  return filter((result) => result, game.guessResults).length;
};

// non-normalized game

export type SanityDocumentMetadata = {
  [key: string]: any;
} & {
  _id: string;
  _createdAt?: string;
};

export type StreakGuessingGamePrompt = SanityDocumentMetadata & {
  [key: string]: any;
} & {
  prompt: string;
};

export type StreakGuessingGameGuessResult = SanityDocumentMetadata & {
  [key: string]: any;
} & {
  challenge: StreakGuessingGameChallenge;
  guesser?: StreakGuessingGamePlayer;
  guesses: string[];
  hintsUsed?: string[];
  guessedCorrectly?: boolean;
};

export type StreakGuessingGamePlayer = SanityDocumentMetadata & {
  [key: string]: any;
} & {
  username?: string;
};

export type StreakGuessingGameDrawing = SanityDocumentMetadata & {
  [key: string]: any;
} & {};

export type StreakGuessingGameChallenge = SanityDocumentMetadata & {
  [key: string]: any;
} & {
  challenger: StreakGuessingGamePlayer;
  gamePrompt: StreakGuessingGamePrompt;
  choodle?: StreakGuessingGameDrawing;
};

export type StreakGuessingGame = SanityDocumentMetadata & {
  [key: string]: any;
} & {
  currentChallenge: StreakGuessingGameChallenge;
  player1: StreakGuessingGamePlayer;
  player2?: StreakGuessingGamePlayer;
  guessResults: StreakGuessingGameGuessResult[];
};

export const streakCount = (game?: StreakGuessingGame): number => {
  if (!game) return 0;
  if (!game.guessResults) return 0;
  if (isGameComplete(game)) return 0;

  return filter(
    (guessResult) => guessResult.guessedCorrectly,
    game.guessResults,
  ).length;
};

export const createEmptyGameFromChallenge = (
  challenge: StreakGuessingGameChallenge,
): StreakGuessingGame => {
  return {
    _id: challenge._id,
    createdAt: challenge.createdAt,
    currentChallenge: { ...challenge, challenger: challenge.challenger },
    player1: challenge.challenger,
    guessResults: [],
  };
};

export const otherPlayer = (
  currentPlayer: StreakGuessingGamePlayer,
  game: StreakGuessingGame,
) => {
  if (currentPlayer._id === game.player1._id && game.player2) {
    return game.player2;
  }
  return game.player1;
};

export const whoseTurn = (
  game: StreakGuessingGame,
): StreakGuessingGamePlayer => {
  if (!game.player2) return game.player1;
  if (!game.currentChallenge.choodle) return game.currentChallenge.challenger;

  const currentGuessResult = guessResultForCurrentChallenge(game);
  if (!currentGuessResult) {
    return otherPlayer(game.currentChallenge.challenger, game);
  }
  if (currentGuessResult?.guessedCorrectly === undefined) {
    return otherPlayer(game.currentChallenge.challenger, game);
  }

  return otherPlayer(game.currentChallenge.challenger, game);
};

export const guessResultForCurrentChallenge = (game: StreakGuessingGame) => {
  return find(
    (guessResult) => guessResult.challenge._id === game.currentChallenge._id,
    game.guessResults,
  );
};

export const whichAction = (game: StreakGuessingGame): string => {
  if (!game.currentChallenge.choodle) return "draw";
  if (!game.player2) return "share";

  const currentGuessResult = guessResultForCurrentChallenge(game);
  if (currentGuessResult && currentGuessResult.guessedCorrectly !== undefined) {
    if (game.currentChallenge.gamePrompt && !game.currentChallenge.choodle) {
      return "draw";
    }

    return "pick";
  }

  return "guess";
};

export const isPlayerInGame = (
  game: StreakGuessingGame,
  player?: StreakGuessingGamePlayer,
) => {
  return game.player1?._id === player?._id || game.player2?._id === player?._id;
};
