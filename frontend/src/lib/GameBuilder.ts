import type {
  StreakGuessingGame,
  StreakGuessingGameChallenge,
  StreakGuessingGameDrawing,
  StreakGuessingGameGuessResult,
  StreakGuessingGamePlayer,
  StreakGuessingGamePrompt,
} from '$lib/CWFGame'
import { v4 as uuid } from 'uuid'
import { isGameComplete, otherPlayer, whoseTurn } from '$lib/CWFGame'
import fp from 'lodash/fp'

const GUESS_LIMIT = 3

export class GameBuilder {
  constructor(private game: StreakGuessingGame) {}

  static fromChallenge(
    challenge: StreakGuessingGameChallenge,
    otherPlayer?: StreakGuessingGamePlayer
  ) {
    const game: StreakGuessingGame = {
      _id: GameBuilder.generateIdFor('game'),
      // FIXME: this is important when we're using a challenge, but when we save it we might want a real date
      _createdAt: challenge._createdAt,
      currentChallenge: challenge,
      player1: challenge.challenger,
      player2: otherPlayer,
      guessResults: [],
    }

    return new GameBuilder(game)
  }

  playerGuesses(
    player: StreakGuessingGamePlayer,
    guessAttempt: string,
    challenge: StreakGuessingGameChallenge = this.game.currentChallenge
  ) {
    let guessedCorrectly = undefined

    if (!this.game.player2) {
      this.game.player2 = player
    }

    if (guessAttempt === this.game.currentChallenge.gamePrompt.prompt) {
      guessedCorrectly = true
    }

    const guessResultIndex = fp.findIndex((guessResult) => {
      return guessResult.challenge._id === challenge._id
    }, this.game.guessResults)

    if (guessResultIndex >= 0) {
      this.game.guessResults[guessResultIndex].guesses = [
        ...this.game.guessResults[guessResultIndex].guesses,
        guessAttempt,
      ]

      if (this.game.guessResults[guessResultIndex].guesses.length >= GUESS_LIMIT) {
        this.game.guessResults[guessResultIndex].guessedCorrectly = false
      }

      return this
    }

    this.game.guessResults = [
      ...this.game.guessResults,
      {
        _id: GameBuilder.generateIdFor('guess'),
        challenge: this.game.currentChallenge,
        guesser: player,
        guesses: [guessAttempt],
        guessedCorrectly: guessedCorrectly,
      },
    ]

    return this
  }

  playerPicks(player: StreakGuessingGamePlayer, prompt: StreakGuessingGamePrompt) {
    const challenge: StreakGuessingGameChallenge = {
      _id: GameBuilder.generateIdFor('challenge'),
      _createdAt: 'now',
      challenger: player,
      gamePrompt: prompt,
    }

    if (isGameComplete(this.game)) {
      return GameBuilder.fromChallenge(challenge, otherPlayer(player, this.game))
    }

    this.game.currentChallenge = challenge

    return this
  }

  playerDraws(player: StreakGuessingGamePlayer, drawing: StreakGuessingGameDrawing) {
    if (whoseTurn(this.game) == player) {
      this.game.currentChallenge.choodle = drawing
    } else {
      // TODO: the wrong player is drawing
    }

    return this
  }

  public get build(): StreakGuessingGame {
    return this.game
  }

  static generateIdFor(type: string) {
    return `${type}-${uuid()}`
  }
}
