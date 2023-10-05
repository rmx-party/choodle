<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { backgroundColour } from "$lib/Configuration";
  import Button from "../../../components/Button.svelte";
  import MetaData from "../../../components/MetaData.svelte";

  export let data

  let playerId = 'some-player-id' // TODO: fetch creatorId from storage

  // TODO: CMS-populate all the copy / non-dynamic html contents

  const startGame = async () => {
    await goto(`/game/cwf/pick`)
  }

  const nudge = (gameId) => {
    return async (event) => {
      // TODO: handle nudge for a game awaiting an action from the other player
    }
  }

  const draw = (gameId) => {
    return async (event) => {
      // TODO: start a new prompt pick to add a drawing to an existing game
    }
  }
</script>

<MetaData 
  title="Choodle with Friends" 
  themeColor={backgroundColour}
  url={$page.url}
/>

<div class="container">
  <Button variant="primary" colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>

  <section class="live-games">
    <strong>Live games</strong>

    {#if (0 >= data.liveGames.length)}
      <p>Start a new game to view them here.</p>
    {:else}
      <ul>
        {#each data.liveGames as liveGame}
          <li id={liveGame._id}>
            <div class="img">image</div>
            {#if liveGame.turn === playerId}
              <span class="status">
                Your turn
              </span>
              <Button on:click={draw(liveGame._id)}>Draw</Button>
            {:else}
              <span class="status">
                Their turn
              </span>
              <Button on:click={nudge(liveGame._id)}>Nudge</Button>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    padding: 1rem;
    gap: 1rem;
    align-items: center;
    justify-content: center;

    min-height: 100vh;
  }

  .live-games {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;

    border-radius: 1rem;
    background: var(--colors-greyscale-50, #F1F1F1);
  }

  .live-games > ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  .live-games > ul > li {
    list-style-type: none;
    padding: 1rem;
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 1rem;

    justify-content: stretch;
    align-items: center;
    width: 100%;

    border-radius: 0.75rem;
    background: var(--colors-greyscale-1, #FCFCFC);
  }

  .live-games .img {
    display: block;
    height: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    border: 1px solid green;
  }
</style>
