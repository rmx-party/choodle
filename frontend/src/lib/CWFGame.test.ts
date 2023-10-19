import {describe, expect, it} from 'vitest';
import {addGuessToGame, createCWFGame, isGameComplete, streakCount} from "$lib/CWFGame";

describe('CWFGame', () => {
  const challenge = {
    challenger: {
      _id: 'player1-id'
    }
  }
  const guesser = {
    _id: 'player2-id'
  }

  describe('creation', () => {
    const game = createCWFGame(challenge, guesser)

    it('sets challenger as player1', () => {
      expect(game.player1).toEqual(challenge.challenger._id)
    });

    it('sets first guesser as player2', () => {
      expect(game.player2).toEqual(guesser._id)
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
    const gameWithOneIncorrectGuess = addGuessToGame(createCWFGame(challenge, guesser), false)

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
    const game = createCWFGame(challenge, guesser)
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

});
