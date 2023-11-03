<script lang="ts">
  import {
    streakCount,
    type StreakGuessingGame,
    type StreakGuessingGameChallenge,
    type StreakGuessingGamePlayer, whichAction,
  } from '$lib/CWFGame';
  import {goto} from '$app/navigation';
  import fp from 'lodash/fp';
  import streakFlame from '$lib/assets/streak-flame.svg';

  export let currentChoodler: StreakGuessingGamePlayer;
  export let game: StreakGuessingGame;
  export let gameListUserUnknownText: string;

  const otherPlayerIn = (game: StreakGuessingGame) => {
    if (game.player1?._id === currentChoodler._id)
      return game.player2?.username || gameListUserUnknownText;
    return game.player1?.username || gameListUserUnknownText;
  };

  const generateLinkFor = (game: StreakGuessingGame): string => {
    switch (whichAction(game)) {
      case "pick":
        return `/game/cwf/pick/${game.currentChallenge._id}`
      case "guess":
        return `/game/cwf/guess/${fp.last(game.guessResults)?.challenge?._id}`
      case "share":
        return `/game/cwf/share/${game.currentChallenge._id}`
    }
  }
</script>

<div class="game-entry">
  <a href={generateLinkFor(game)} on:click={() => goto(generateLinkFor(game))}
  >{otherPlayerIn(game)}</a
  >
  <div class="game-entry-streak"><img src={streakFlame}/>{streakCount(game)}</div>
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
