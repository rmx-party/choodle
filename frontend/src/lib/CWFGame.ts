import fp from "lodash/fp";

export type NormalizedCWFGame = {
  player1: string;
  player2: string;
  guessResults: boolean[];
};

export const isNormalizedGameComplete = (guessResults: boolean[]) => {
  return fp.any((guess) => guess === false, guessResults);
};

export const normalizeGame = (game): NormalizedCWFGame => {
  const normalizedGame = createCWFGame(game?.player1?._id, game?.player2?._id);
  return {
    ...game,
    ...normalizedGame,
    guessResults: fp.map((result) => {
      if ([true, false].includes(result)) return result;
      return result.guessedCorrectly;
    }, [
      ...game.guessResults,
    ]),
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

export const isGameComplete = (game) => {
  return isNormalizedGameComplete(normalizeGame(game).guessResults);
};

export const normalizedGameStreakCount = (game: NormalizedCWFGame) => {
  return fp.filter((result) => result, game.guessResults).length;
};
