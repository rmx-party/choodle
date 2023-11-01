import {describe, expect, it} from "vitest";
import {
  addGuessToGame,
  createCWFGame,
  isGameComplete,
  isNormalizedGameComplete,
  normalizedGameStreakCount,
} from "$lib/CWFGame";
import fp from "lodash/fp.js";

type SanityDocumentMetadata = {
  [key: string]: any
} & {
  _id: string,
  createdAt: string,
}

type StreakGuessingGamePrompt = SanityDocumentMetadata & {
  [key: string]: any
} & {}

type StreakGuessingGameGuessResult = SanityDocumentMetadata & {
  [key: string]: any
} & {
  challenge: StreakGuessingGameChallenge,
  guesser?: StreakGuessingGamePlayer,
  guesses: string[],
  hintsUsed?: string[],
  guessedCorrectly?: boolean,
}

type StreakGuessingGamePlayer = SanityDocumentMetadata & {
  [key: string]: any
} & {}

type StreakGuessingGameChallenge = SanityDocumentMetadata & {
  [key: string]: any
} & {
  challenger: StreakGuessingGamePlayer,
  prompt: StreakGuessingGamePrompt,
}

type StreakGuessingGame = SanityDocumentMetadata & {
  [key: string]: any
} & {
  currentChallenge: StreakGuessingGameChallenge,
  player1: StreakGuessingGamePlayer,
  player2?: StreakGuessingGamePlayer,
  guessResults: StreakGuessingGameGuessResult[],
}

const streakCount = (game: StreakGuessingGame): number => {
  return fp.size(fp.filter(guessResult => guessResult.guessedCorrectly, game.guessResults))
}

const createEmptyGameFromChallenge = (challenge: StreakGuessingGameChallenge): StreakGuessingGame => {
  return {
    _id: challenge._id,
    createdAt: challenge.createdAt,
    currentChallenge: {...challenge, challenger: challenge.challenger},
    player1: challenge.challenger,
    guessResults: [],
  }
}

describe("StreakGuessingGame", () => {
  const prompt: StreakGuessingGamePrompt = {_id: "", createdAt: ""}
  const challenger: StreakGuessingGamePlayer = {_id: "", createdAt: ""}
  const guesser: StreakGuessingGamePlayer = {_id: "", createdAt: ""}
  const challenge: StreakGuessingGameChallenge = {_id: "", challenger, createdAt: "", prompt}
  const incompleteGuess: StreakGuessingGameGuessResult = {
    _id: "",
    challenge: challenge,
    createdAt: "",
    guesses: ["foo"]
  }
  const incorrectInOneGuess: StreakGuessingGameGuessResult = {
    _id: "",
    challenge: challenge,
    createdAt: "",
    guesses: ["bar"],
    guessedCorrectly: false,
  }
  const correctInOneGuess: StreakGuessingGameGuessResult = {
    _id: "",
    challenge: challenge,
    createdAt: "",
    guesses: ["baz"],
    guessedCorrectly: true
  }
  const emptyGame: StreakGuessingGame = {
    _id: challenge._id,
    createdAt: challenge.createdAt,
    currentChallenge: {...challenge, challenger: challenge.challenger},
    player1: challenger,
    guessResults: [],
  }

  describe("constructing a bare game from a challenge", () => {
    expect(createEmptyGameFromChallenge(challenge)).toEqual(emptyGame)
  });

  describe("streak counting", () => {
    it("starts at zero", () => {
      expect(streakCount(emptyGame)).toBe(0)
    });

    it("does not start a streak if the first guesser has not completed guessing", () => {
      const game: StreakGuessingGame = {
        _id: challenge._id,
        createdAt: challenge.createdAt,
        currentChallenge: {...challenge, challenger: challenge.challenger},
        player1: challenger,
        player2: guesser,
        guessResults: [incompleteGuess],
      }

      expect(streakCount(game)).toBe(0)
    })

    it("does not start a streak if the first guesser has guessed incorrectly", () => {
      const game: StreakGuessingGame = {
        _id: challenge._id,
        createdAt: challenge.createdAt,
        currentChallenge: {...challenge, challenger: challenge.challenger},
        player1: challenger,
        player2: guesser,
        guessResults: [incorrectInOneGuess],
      }

      expect(streakCount(game)).toBe(0)
    })

    it("starts a streak if the first guesser has guessed correctly on the first try", () => {
      const game: StreakGuessingGame = {
        _id: challenge._id,
        createdAt: challenge.createdAt,
        currentChallenge: {...challenge, challenger: challenge.challenger},
        player1: challenger,
        player2: guesser,
        guessResults: [correctInOneGuess],
      }

      expect(streakCount(game)).toBe(1)
    })

    it("ends a streak if the second guesser has guessed incorrectly on the first try", () => {
      const game: StreakGuessingGame = {
        _id: challenge._id,
        createdAt: challenge.createdAt,
        currentChallenge: {...challenge, challenger: challenge.challenger},
        player1: challenger,
        player2: guesser,
        guessResults: [correctInOneGuess, incorrectInOneGuess],
      }

      expect(streakCount(game)).toBe(1)
    });
  });
});

describe("NormalizedCWFGame", () => {
  describe("creation", () => {
    const game = createCWFGame("player1-id", "player2-id");

    it("sets challenger as player1", () => {
      expect(game.player1).toEqual("player1-id");
    });

    it("sets first guesser as player2", () => {
      expect(game.player2).toEqual("player2-id");
    });

    it("sets guesses to an empty list", () => {
      expect(game.guessResults).toEqual([]);
    });

    it("is not complete", () => {
      expect(isGameComplete(game)).toBeFalsy();
    });

    it("has a streak of 0", () => {
      expect(normalizedGameStreakCount(game)).toEqual(0);
    });
  });

  describe("with one incorrect guess", () => {
    const gameWithOneIncorrectGuess = addGuessToGame(
      createCWFGame("player1-id", "player2-id"),
      false,
    );

    it("contains the guess", () => {
      expect(gameWithOneIncorrectGuess.guessResults.length).toEqual(1);
    });

    it("has a streak of 0", () => {
      expect(normalizedGameStreakCount(gameWithOneIncorrectGuess)).toEqual(0);
    });

    it("is complete", () => {
      expect(isGameComplete(gameWithOneIncorrectGuess)).toBeTruthy();
    });
  });

  describe("with one correct guess", () => {
    const game = createCWFGame("player1-id", "player2-id");
    const gameWithOneCorrectGuess = addGuessToGame(game, true);

    it("contains the first guess", () => {
      expect(gameWithOneCorrectGuess.guessResults).toEqual([true]);
    });

    it("the game is not complete", () => {
      expect(isGameComplete(gameWithOneCorrectGuess)).toBeFalsy();
    });

    it("has a streak of 1", () => {
      expect(normalizedGameStreakCount(gameWithOneCorrectGuess)).toEqual(1);
    });

    describe("with one correct guess and one incorrect guess", () => {
      const gameWithOneCorrectGuessAndOneIncorrectGuess = addGuessToGame(
        gameWithOneCorrectGuess,
        false,
      );

      it("contains the second guess", () => {
        expect(gameWithOneCorrectGuessAndOneIncorrectGuess.guessResults.length)
          .toEqual(2);
      });

      it("is complete", () => {
        expect(isGameComplete(gameWithOneCorrectGuessAndOneIncorrectGuess))
          .toBeTruthy();
      });
    });

    describe("with multiple correct guesses", () => {
      const gameWithMultipleCorrectGuesses = addGuessToGame(
        addGuessToGame(addGuessToGame(gameWithOneCorrectGuess, true), true),
        true,
      );

      it("is not complete", () => {
        expect(isGameComplete(gameWithMultipleCorrectGuesses)).toBeFalsy();
      });

      it("has a streak of 4", () => {
        expect(normalizedGameStreakCount(gameWithMultipleCorrectGuesses)).toEqual(4);
      });
    });

    describe("with multiple correct guesses and an incorrect guess", () => {
      const gameWithMultipleCorrectGuessesAndAnIncorrectGuess = addGuessToGame(
        addGuessToGame(addGuessToGame(gameWithOneCorrectGuess, true), false),
        true,
      );

      it("is complete", () => {
        expect(
          isGameComplete(gameWithMultipleCorrectGuessesAndAnIncorrectGuess),
        ).toBeTruthy();
      });

      it("has a streak of 3", () => {
        expect(normalizedGameStreakCount(gameWithMultipleCorrectGuessesAndAnIncorrectGuess))
          .toEqual(3);
      });
    });
  });

  describe("gameComplete", () => {
    it("is true when a single guessResult is false", () => {
      expect(isNormalizedGameComplete([false])).toBeTruthy();
    });
    it("is false when a single guessResult is true", () => {
      expect(isNormalizedGameComplete([true])).toBeFalsy();
    });
    it("is false when a single guessResult is null", () => {
      expect(isNormalizedGameComplete([null])).toBeFalsy();
    });
    it("is true when a guessResult contains false", () => {
      expect(isNormalizedGameComplete([true, false, true])).toBeTruthy();
    });
    it("is false when all guessResults are true", () => {
      expect(isNormalizedGameComplete([true, true, true])).toBeFalsy();
    });
    it("is false when a guessResult contains null", () => {
      expect(isNormalizedGameComplete([true, true, null])).toBeFalsy();
    });
  });
});
