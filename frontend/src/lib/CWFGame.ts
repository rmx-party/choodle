import fp from "lodash/fp";

export type CWFGame = {
  player1: string
  player2: string
  guessResults: boolean[]
}

export const createCWFGame = (challenge, firstGuesser): CWFGame => {
  return {
    player1: challenge.challenger._id,
    player2: firstGuesser._id,
    guessResults: [],
  }
}

export const addGuessToGame = (game: CWFGame, guessResult: boolean): CWFGame => {
  return {
    ...game,
    guessResults: [...game.guessResults, guessResult],
  }
};

export const isGameComplete = (game: CWFGame) => {
  return fp.any(result => !result, game.guessResults)
};

export const streakCount = (game: CWFGame) => {
  return fp.filter(result => result, game.guessResults).length
}
