<script lang="ts">
  import {
    isGameComplete,
    streakCount,
    type StreakGuessingGame,
    type StreakGuessingGameChallenge,
    type StreakGuessingGamePlayer,
  } from '$lib/CWFGame'
  import { goto } from '$app/navigation'
  import last from 'lodash/fp/last'
  import streakFlame from '$lib/assets/streak-flame.svg'

  export let currentChoodler: StreakGuessingGamePlayer
  export let game: StreakGuessingGame
  export let gameListUserUnknownText: string
  let gameOver: boolean = false
  $: gameOver = isGameComplete(game)

  const otherPlayerIn = (game: StreakGuessingGame) => {
    if (game.player1?._id === currentChoodler._id)
      return game.player2?.username || gameListUserUnknownText
    return game.player1?.username || gameListUserUnknownText
  }

  const generateLinkFor = ({
    currentChallenge,
  }: {
    currentChallenge: StreakGuessingGameChallenge
  }): string => {
    if (currentChallenge.challenger._id === currentChoodler._id && !currentChallenge.choodle) {
      return `/${currentChallenge._id}`
    }

    if (currentChallenge.challenger._id !== currentChoodler._id && !currentChallenge.choodle) {
      return `/guess/${last(game.guessResults)?.challenge?._id}`
    }

    return `/guess/${currentChallenge._id}`
  }
</script>

<div class="game-entry" class:game-over={gameOver}>
  <a href={generateLinkFor(game)} on:click={() => goto(generateLinkFor(game))}
    >{otherPlayerIn(game)}</a
  >
  <div class="game-entry-streak"><img src={streakFlame} />{streakCount(game)}</div>
</div>

<style>
  .game-entry {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem 0;
  }

  .game-entry img {
    width: 24px;
    height: 24px;
  }

  .game-entry-streak {
    display: flex;
    align-items: center;

    color: var(--text-text-primary, #141518);
    text-align: center;
    font-family: DejaVu Sans;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 16.8px */
  }
</style>
