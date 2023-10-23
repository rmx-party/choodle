import {describe, expect, it} from 'vitest';
import {addGuessToGame, createCWFGame, gameComplete, isGameComplete, streakCount} from "$lib/CWFGame";

describe('CWFGame', () => {
  describe('creation', () => {
    const game = createCWFGame("player1-id", "player2-id")

    it('sets challenger as player1', () => {
      expect(game.player1).toEqual("player1-id")
    });

    it('sets first guesser as player2', () => {
      expect(game.player2).toEqual("player2-id")
    });

    it('sets guesses to an empty list', () => {
      expect(game.guessResults).toEqual([])
    });

    it('is not complete', () => {
      expect(isGameComplete(game)).toBeFalsy()
    });

    it('has a streak of 0', () => {
      expect(streakCount(game)).toEqual(0)
    })
  });

  describe('with one incorrect guess', () => {
    const gameWithOneIncorrectGuess = addGuessToGame(createCWFGame("player1-id", "player2-id"), false)

    it('contains the guess', () => {
      expect(gameWithOneIncorrectGuess.guessResults.length).toEqual(1)
    });

    it('has a streak of 0', () => {
      expect(streakCount(gameWithOneIncorrectGuess)).toEqual(0)
    });

    it('is complete', () => {
      expect(isGameComplete(gameWithOneIncorrectGuess)).toBeTruthy()
    });
  });

  describe('with one correct guess', () => {
    const game = createCWFGame("player1-id", "player2-id")
    const gameWithOneCorrectGuess = addGuessToGame(game, true)

    it('contains the first guess', () => {
      expect(gameWithOneCorrectGuess.guessResults).toEqual([true])
    });

    it('the game is not complete', () => {
      expect(isGameComplete(gameWithOneCorrectGuess)).toBeFalsy()
    });

    it('has a streak of 1', () => {
      expect(streakCount(gameWithOneCorrectGuess)).toEqual(1)
    })

    describe('with one correct guess and one incorrect guess', () => {
      const gameWithOneCorrectGuessAndOneIncorrectGuess = addGuessToGame(gameWithOneCorrectGuess, false)

      it('contains the second guess', () => {
        expect(gameWithOneCorrectGuessAndOneIncorrectGuess.guessResults.length).toEqual(2)
      });

      it('is complete', () => {
        expect(isGameComplete(gameWithOneCorrectGuessAndOneIncorrectGuess)).toBeTruthy()
      });
    });

    describe('with multiple correct guesses', () => {
      const gameWithMultipleCorrectGuesses = addGuessToGame(addGuessToGame(addGuessToGame(gameWithOneCorrectGuess, true), true), true)

      it('is not complete', () => {
        expect(isGameComplete(gameWithMultipleCorrectGuesses)).toBeFalsy()
      });

      it('has a streak of 4', () => {
        expect(streakCount(gameWithMultipleCorrectGuesses)).toEqual(4)
      })
    });

    describe('with multiple correct guesses and an incorrect guess', () => {
      const gameWithMultipleCorrectGuessesAndAnIncorrectGuess = addGuessToGame(addGuessToGame(addGuessToGame(gameWithOneCorrectGuess, true), false), true)

      it('is complete', () => {
        expect(isGameComplete(gameWithMultipleCorrectGuessesAndAnIncorrectGuess)).toBeTruthy()
      });

      it('has a streak of 3', () => {
        expect(streakCount(gameWithMultipleCorrectGuessesAndAnIncorrectGuess)).toEqual(3)
      })
    });
  });

  describe('gameComplete', () => {
    it('is true when a single guessResult is false', () => {
      expect(gameComplete([false])).toBeTruthy()
    });
    it('is false when a single guessResult is true', () => {
      expect(gameComplete([true])).toBeFalsy()
    });
    it('is false when a single guessResult is null', () => {
      expect(gameComplete([null])).toBeFalsy()
    });
    it('is true when a guessResult contains false', () => {
      expect(gameComplete([true, false, true])).toBeTruthy()
    });
    it('is false when all guessResults are true', () => {
      expect(gameComplete([true, true, true])).toBeFalsy()
    });
    it('is false when a guessResult contains null', () => {
      expect(gameComplete([true, true, null])).toBeFalsy()
    });
  });
});
