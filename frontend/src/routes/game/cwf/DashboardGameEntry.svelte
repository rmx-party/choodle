<script lang="ts">
  import {normalizeGame, streakCount} from "$lib/CWFGame";
  import {goto} from '$app/navigation';
  import fp from "lodash/fp";

  export let currentChoodler
  export let game

  const otherPlayerIn = (game) => {
    if (game.player1._id === currentChoodler._id) return game.player2.username || 'player2 unknown';
    return game.player1.username || 'player1 unknown';
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

<p>
  <a href={generateLinkFor(game)} on:click={goto(generateLinkFor(game))}>
    {otherPlayerIn(game)} {streakCount(normalizeGame(game))}
  </a>
</p>
