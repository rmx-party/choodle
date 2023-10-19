import fp from "lodash/fp";

export type CWFGame = {
  player1: string
  player2: string
  guessResults: boolean[]
}

export const normalizeGame = (game): CWFGame => {
  const normalizedGame = createCWFGame(game.player1._id, game.player2._id)

  fp.reduce((guessResult, accumulator: CWFGame) => {
    return addGuessToGame(accumulator, guessResult.guessedCorrectly)
  }, normalizedGame, game.guessResults)

  return normalizedGame
}

export const createCWFGame = (player1Id, player2Id): CWFGame => {
  return {
    player1: player1Id,
    player2: player2Id,
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
