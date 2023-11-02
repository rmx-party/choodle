import type {
  StreakGuessingGame,
  StreakGuessingGameChallenge,
} from "$lib/CWFGame";
import {v4 as uuid} from "uuid"

export class GameBuilder {
  constructor(private game: StreakGuessingGame) {
  }

  static fromChallenge(challenge: StreakGuessingGameChallenge) {
    const game: StreakGuessingGame = {
      _id: GameBuilder.generateIdFor('game'),
      createdAt: "now",
      currentChallenge: challenge,
      player1: challenge.challenger,
      guessResults: [],
    }

    return new GameBuilder(game)
  }

  public get build(): StreakGuessingGame {
    return this.game
  }

  private static generateIdFor(type: string) {
    return `${type}-${uuid()}`
  }
}
