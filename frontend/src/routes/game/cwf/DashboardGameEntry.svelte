<script lang="ts">
  import {normalizeGame, normalizedGameStreakCount} from '$lib/CWFGame';
  import {goto} from '$app/navigation';
  import fp from 'lodash/fp';
  import streakFlame from '$lib/assets/streak-flame.svg';

  export let currentChoodler;
  export let game;
  export let gameListUserUnknownText;

  const otherPlayerIn = (game) => {
    if (game.player1?._id === currentChoodler._id)
      return game.player2?.username || gameListUserUnknownText;
    return game.player1?.username || gameListUserUnknownText;
  };

  const generateLinkFor = (game): string => {
    let currentChallenge = game.currentChallenge;

    if (currentChallenge.challenger._id === currentChoodler._id && !currentChallenge.choodle) {
      return `/game/cwf/pick/${currentChallenge._id}`;
    }

    if (currentChallenge.challenger._id !== currentChoodler._id && !currentChallenge.choodle) {
      return `/game/cwf/guess/${fp.last(game.guessResults).challenge._id}`;
    }

    return `/game/cwf/guess/${currentChallenge._id}`;
  };
</script>

<div class="game-entry">
  <a href={generateLinkFor(game)} on:click={goto(generateLinkFor(game))}>{otherPlayerIn(game)}</a>
  <div class="game-entry-streak"><img src={streakFlame}/>{normalizedGameStreakCount(normalizeGame(game))}</div>
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
