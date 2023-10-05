<script lang="ts">
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import Button from "../../../components/Button.svelte";
  import {browser} from "$app/environment";
  import { getDeviceId, getEmail, getUsername, locateCreator } from "$lib/CreatorUtils";
  import LayoutContainer from "../../../components/LayoutContainer.svelte";
  import { page } from "$app/stores";
  import MetaData from "../../../components/MetaData.svelte";
  import { pageBackgroundDefault } from "$lib/Configuration";

  export let data
  let playerId

  // TODO: CMS-populate all the copy / non-dynamic html contents

  const startGame = async () => {
    await goto(`/game/defcon/pick`)
  }

  const nudge = (gameId) => {
    return async (event) => {
      // TODO: handle nudge for a game awaiting an action from the other player
    }
  }

  const hasCreatedAChallenge = () => {
    return false;
  }

  onMount(async () => {
    if (!browser) return;

    // Explicitly reset bg color since it sticks after being set on next page and then navigating back
    let root = document.documentElement;
    root.style.setProperty('--page-background-color', 'rgba(20, 21, 24, 0.03)');

    playerId = (await locateCreator({
      email: await getEmail(),
      username: await getUsername(),
      deviceId: await getDeviceId()
    }))._id; // TODO: migrate global creator/player state to a store shared across pages

  })
</script>

<MetaData
  title="Choodle w/ Friends: DEFcon Edition"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer>
  {#if !hasCreatedAChallenge()}
    <Button variant="primary" colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
  {/if}

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
</LayoutContainer>

<style>
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
