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

type StreakGuessingGameDrawing = SanityDocumentMetadata & {
  [key: string]: any
} & {}

type StreakGuessingGameChallenge = SanityDocumentMetadata & {
  [key: string]: any
} & {
  challenger: StreakGuessingGamePlayer,
  prompt: StreakGuessingGamePrompt,
  choodle?: StreakGuessingGameDrawing,
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
  const player1: StreakGuessingGamePlayer = {_id: "player-1", createdAt: ""}
  const player2: StreakGuessingGamePlayer = {_id: "player-2", createdAt: ""}
  const challengeThatHasNotBeenDrawn: StreakGuessingGameChallenge = {
    _id: "",
    challenger: player1,
    createdAt: "",
    prompt
  }
  const drawing: StreakGuessingGameDrawing = {
    _id: "drawing-1",
    createdAt: "",
  }
  const challengeThatHasBeenDrawn: StreakGuessingGameChallenge = {
    _id: "",
    challenger: player1,
    createdAt: "",
    prompt: prompt,
    choodle: drawing,
  }
  const incompleteGuess: StreakGuessingGameGuessResult = {
    _id: "",
    challenge: challengeThatHasNotBeenDrawn,
    createdAt: "",
    guesses: ["foo"]
  }
  const incorrectInOneGuess: StreakGuessingGameGuessResult = {
    _id: "",
    challenge: challengeThatHasNotBeenDrawn,
    createdAt: "",
    guesses: ["bar"],
    guessedCorrectly: false,
  }
  const correctInOneGuess: StreakGuessingGameGuessResult = {
    _id: "",
    challenge: challengeThatHasNotBeenDrawn,
    createdAt: "",
    guesses: ["baz"],
    guessedCorrectly: true
  }
  const emptyGame: StreakGuessingGame = {
    _id: challengeThatHasNotBeenDrawn._id,
    createdAt: challengeThatHasNotBeenDrawn.createdAt,
    currentChallenge: {...challengeThatHasNotBeenDrawn, challenger: challengeThatHasNotBeenDrawn.challenger},
    player1: player1,
    guessResults: [],
  }
  const gameWithDrawingThatHasNoOtherPlayer: StreakGuessingGame = {
    _id: challengeThatHasNotBeenDrawn._id,
    createdAt: challengeThatHasNotBeenDrawn.createdAt,
    currentChallenge: {...challengeThatHasBeenDrawn, challenger: challengeThatHasBeenDrawn.challenger},
    choodle: drawing,
    player1: player1,
    guessResults: [],
  }
  const gameWithDrawingThatHasNotBeenGuessed: StreakGuessingGame = {
    _id: challengeThatHasNotBeenDrawn._id,
    createdAt: challengeThatHasNotBeenDrawn.createdAt,
    currentChallenge: {...challengeThatHasBeenDrawn, challenger: challengeThatHasBeenDrawn.challenger},
    choodle: drawing,
    player1: player1,
    player2: player2,
    guessResults: [],
  }
  const gameWithCorrectlyGuessedChallengeWherePlayerTwoHasNotYetDrawn: StreakGuessingGame = {
    _id: challengeThatHasNotBeenDrawn._id,
    createdAt: challengeThatHasNotBeenDrawn.createdAt,
    currentChallenge: {...challengeThatHasBeenDrawn, challenger: challengeThatHasBeenDrawn.challenger},
    choodle: drawing,
    player1: player1,
    player2: player2,
    guessResults: [{...correctInOneGuess, challenge: challengeThatHasBeenDrawn}],
  }
  const gameWithIncorrectlyGuessedChallengeWherePlayerTwoHasNotYetDrawn: StreakGuessingGame = {
    _id: challengeThatHasNotBeenDrawn._id,
    createdAt: challengeThatHasNotBeenDrawn.createdAt,
    currentChallenge: {...challengeThatHasBeenDrawn, challenger: challengeThatHasBeenDrawn.challenger},
    choodle: drawing,
    player1: player1,
    player2: player2,
    guessResults: [{...incorrectInOneGuess, challenge: challengeThatHasBeenDrawn}],
  }

  describe("constructing a bare game from a challenge", () => {
    expect(createEmptyGameFromChallenge(challengeThatHasNotBeenDrawn)).toEqual(emptyGame)
  });

  describe("streak counting", () => {
    it("starts at zero", () => {
      expect(streakCount(emptyGame)).toBe(0)
    });

    it("does not start a streak if the first guesser has not completed guessing", () => {
      const game: StreakGuessingGame = {
        _id: challengeThatHasNotBeenDrawn._id,
        createdAt: challengeThatHasNotBeenDrawn.createdAt,
        currentChallenge: {...challengeThatHasNotBeenDrawn, challenger: challengeThatHasNotBeenDrawn.challenger},
        player1: player1,
        player2: player2,
        guessResults: [incompleteGuess],
      }

      expect(streakCount(game)).toBe(0)
    })

    it("does not start a streak if the first guesser has guessed incorrectly", () => {
      const game: StreakGuessingGame = {
        _id: challengeThatHasNotBeenDrawn._id,
        createdAt: challengeThatHasNotBeenDrawn.createdAt,
        currentChallenge: {...challengeThatHasNotBeenDrawn, challenger: challengeThatHasNotBeenDrawn.challenger},
        player1: player1,
        player2: player2,
        guessResults: [incorrectInOneGuess],
      }

      expect(streakCount(game)).toBe(0)
    })

    it("starts a streak if the first guesser has guessed correctly on the first try", () => {
      const game: StreakGuessingGame = {
        _id: challengeThatHasNotBeenDrawn._id,
        createdAt: challengeThatHasNotBeenDrawn.createdAt,
        currentChallenge: {...challengeThatHasNotBeenDrawn, challenger: challengeThatHasNotBeenDrawn.challenger},
        player1: player1,
        player2: player2,
        guessResults: [correctInOneGuess],
      }

      expect(streakCount(game)).toBe(1)
    })

    it("ends a streak if the second guesser has guessed incorrectly on the first try", () => {
      const game: StreakGuessingGame = {
        _id: challengeThatHasNotBeenDrawn._id,
        createdAt: challengeThatHasNotBeenDrawn.createdAt,
        currentChallenge: {...challengeThatHasNotBeenDrawn, challenger: challengeThatHasNotBeenDrawn.challenger},
        player1: player1,
        player2: player2,
        guessResults: [correctInOneGuess, incorrectInOneGuess],
      }

      expect(streakCount(game)).toBe(1)
    });
  });

  // what is the current challenge?
  //   when currentChallenge has been drawn, and guessed correctly

  const whoseTurn = (game: StreakGuessingGame): StreakGuessingGamePlayer => {
    if (!game.currentChallenge.choodle) return game.player1
    if (!game.player2) return game.player1
    return game.player2
  }

  const whichAction = (game: StreakGuessingGame): string => {
    if (!game.currentChallenge.choodle) return "draw"
    if (!game.player2) return "share"

    const guessResultForCurrentChallenge = fp.find(guessResult => guessResult.challenge._id === game.currentChallenge._id,
      game.guessResults)
    if (guessResultForCurrentChallenge && guessResultForCurrentChallenge.guessedCorrectly !== undefined) return "pick"

    return "guess"
  }

  describe("whose turn is it anyway?", () => {
    describe("a challenge has been created, but not yet drawn", () => {
      it("is the player1's turn", () => {
        expect(whoseTurn(emptyGame)).toEqual(player1)
      })

      it("needs to be drawn", () => {
        expect(whichAction(emptyGame)).toEqual("draw")
      })
    })

    describe("a challenge has been created and drawn, but not yet opened by a second player", () => {
      it("is player1's turn", () => {
        expect(whoseTurn(gameWithDrawingThatHasNoOtherPlayer)).toEqual(player1)
      })

      it("needs to be shared", () => {
        expect(whichAction(gameWithDrawingThatHasNoOtherPlayer)).toEqual("share")
      })
    })

    describe("a challenge has been created and drawn, but not yet guessed by the second player", () => {
      it("is player2's turn", () => {
        expect(whoseTurn(gameWithDrawingThatHasNotBeenGuessed)).toEqual(player2)
      })

      it("needs to be guessed", () => {
        expect(whichAction(gameWithDrawingThatHasNotBeenGuessed)).toEqual("guess")
      })
    });

    describe("player2 guesses correctly and has not yet picked a new prompt", () => {
      it("is player2's turn", () => {
        expect(whoseTurn(gameWithCorrectlyGuessedChallengeWherePlayerTwoHasNotYetDrawn)).toEqual(player2)
      })

      it("needs to be picked", () => {
        expect(whichAction(gameWithCorrectlyGuessedChallengeWherePlayerTwoHasNotYetDrawn)).toEqual("pick")
      })
    })

    describe("player2 guesses incorrectly and has not yet picked a new prompt", () => {
      it("is player2's turn", () => {
        expect(whoseTurn(gameWithIncorrectlyGuessedChallengeWherePlayerTwoHasNotYetDrawn)).toEqual(player2)
      })

      it("needs to be picked", () => {
        expect(whichAction(gameWithIncorrectlyGuessedChallengeWherePlayerTwoHasNotYetDrawn)).toEqual("pick")
      })

    });
  })
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
