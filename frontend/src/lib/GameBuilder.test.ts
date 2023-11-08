import { describe, expect, it, beforeEach } from 'vitest'
import { GameBuilder } from '$lib/GameBuilder'
import { isGameComplete, streakCount, whichAction, whoseTurn } from '$lib/CWFGame'

const bob = { _id: 'player-bob', createdAt: '' }
const alice = { _id: 'player-alice', createdAt: '' }
const gamePrompt = { _id: 'prompt-1', prompt: 'correct' }
const challenge = {
  _id: 'challenge-1',
  challenger: bob,
  _createdAt: 'challenge creation',
  gamePrompt,
  choodle: { _id: 'choodle-1' },
}

describe('GameBuilder', () => {
  let builder: GameBuilder

  beforeEach(() => {
    builder = GameBuilder.fromChallenge(challenge)
  })

  describe('fromChallenge', () => {
    it('passes through the details from the supplied challenge', () => {
      const game = builder.build

      expect(game.currentChallenge).toEqual(challenge)
      expect(game.player1).toEqual(challenge.challenger)
      expect(game.player2).toBeUndefined()
      expect(game.guessResults).toEqual([])
    })
  })

  describe('playerGuesses', () => {
    describe('player1 tries to guess their own challenge', () => {})

    it('alice makes one incorrect guess', () => {
      const game = builder.playerGuesses(alice, 'incorrect').build

      expect(game.player2).toEqual(alice)
      expect(game.guessResults.length).toEqual(1)
      expect(game.guessResults[0].guessedCorrectly).toBeUndefined()
      expect(game.guessResults[0].guesses[0]).toEqual('incorrect')

      expect(isGameComplete(game)).toBeFalsy()
      expect(whoseTurn(game)).toEqual(alice)
      expect(whichAction(game)).toEqual('guess')
      expect(streakCount(game)).toEqual(0)
    })

    it('alice makes three incorrect guesses', () => {
      const game = builder
        .playerGuesses(alice, 'incorrect1')
        .playerGuesses(alice, 'incorrect2')
        .playerGuesses(alice, 'incorrect3').build

      expect(game.player2).toEqual(alice)
      expect(game.guessResults.length).toEqual(1)
      expect(game.guessResults[0].guessedCorrectly).toEqual(false)
      expect(game.guessResults[0].guesses.length).toEqual(3)

      expect(isGameComplete(game)).toBeTruthy()
      expect(whoseTurn(game)).toEqual(alice)
      expect(whichAction(game)).toEqual('pick')
      expect(streakCount(game)).toEqual(0)
    })

    it('alice guesses correctly on the first try', () => {
      const game = builder.playerGuesses(alice, 'correct').build

      expect(game.player2).toEqual(alice)
      expect(game.guessResults.length).toEqual(1)
      expect(game.guessResults[0].guessedCorrectly).toEqual(true)
      expect(game.guessResults[0].guesses.length).toEqual(1)

      expect(isGameComplete(game)).toBeFalsy()
      expect(whoseTurn(game)).toEqual(alice)
      expect(whichAction(game)).toEqual('pick')
      expect(streakCount(game)).toEqual(1)
    })

    it('alice guesses correctly and then picks', () => {
      const game = builder.playerGuesses(alice, 'correct').playerPicks(alice, gamePrompt).build

      expect(game.player2).toEqual(alice)
      expect(game.guessResults.length).toEqual(1)
      expect(game.guessResults[0].guessedCorrectly).toEqual(true)
      expect(game.guessResults[0].guesses.length).toEqual(1)

      expect(isGameComplete(game)).toBeFalsy()
      expect(whoseTurn(game)).toEqual(alice)
      expect(whichAction(game)).toEqual('draw')
      expect(streakCount(game)).toEqual(1)
    })

    it('alice guesses correctly, picks, and draws', () => {
      const game = builder
        .playerGuesses(alice, 'correct')
        .playerPicks(alice, gamePrompt)
        .playerDraws(alice, { _id: '' }).build

      expect(game.player2).toEqual(alice)
      expect(game.guessResults.length).toEqual(1)
      expect(game.guessResults[0].guessedCorrectly).toEqual(true)
      expect(game.guessResults[0].guesses.length).toEqual(1)

      expect(isGameComplete(game)).toBeFalsy()
      expect(whoseTurn(game)).toEqual(bob)
      expect(whichAction(game)).toEqual('guess')
      expect(streakCount(game)).toEqual(1)
    })

    it('alice guesses correct, picks, draws, and player1 guesses incorrectly 3 times', () => {
      const game = builder
        .playerGuesses(alice, 'correct')
        .playerPicks(alice, gamePrompt)
        .playerDraws(alice, { _id: '' })
        .playerGuesses(bob, 'incorrect3')
        .playerGuesses(bob, 'incorrect2')
        .playerGuesses(bob, 'incorrect1').build

      expect(game.guessResults.length).toEqual(2)
      expect(game.guessResults[1].guessedCorrectly).toEqual(false)
      expect(game.guessResults[1].guesses.length).toEqual(3)

      expect(isGameComplete(game)).toBeTruthy()
      expect(whoseTurn(game)).toEqual(bob)
      expect(whichAction(game)).toEqual('pick')
      expect(streakCount(game)).toEqual(0)
    })
  })

  describe('playerPicks', () => {
    it('bob has ended the streak, and picks starting a new streak', () => {
      const oldGameBuilder = builder
        .playerGuesses(alice, 'correct')
        .playerPicks(alice, gamePrompt)
        .playerDraws(alice, { _id: '' })
        .playerGuesses(bob, 'correct')
        .playerPicks(bob, gamePrompt)
        .playerGuesses(alice, 'incorrectA')
        .playerGuesses(alice, 'incorrectB')
        .playerGuesses(alice, 'incorrectC')
      const oldGame = oldGameBuilder.build

      const newGame = oldGameBuilder.playerPicks(alice, gamePrompt).build

      expect(oldGame._id).not.toEqual(newGame._id)
      expect(newGame.player1).toEqual(alice)
      expect(newGame.player2).toEqual(bob)

      expect(newGame.guessResults.length).toEqual(0)

      expect(isGameComplete(newGame)).toBeFalsy()
      expect(whoseTurn(newGame)).toEqual(alice)
      expect(whichAction(newGame)).toEqual('draw')
      expect(streakCount(newGame)).toEqual(0)
    })
  })
})
