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
  let creator
  let hasCreatedAChallenge = false

  // TODO: CMS-populate all the copy / non-dynamic html contents

  const startGame = async () => {
    await goto(`/game/defcon/pick`)
  }

  const nudge = (gameId) => {
    return async (event) => {
      // TODO: handle nudge for a game awaiting an action from the other player
    }
  }

  onMount(async () => {
    if (!browser) return;

    creator = (await locateCreator({
      email: await getEmail(),
      username: await getUsername(),
      deviceId: await getDeviceId()
    })); // TODO: migrate global creator/player state to a store shared across pages

    console.log({creator})
    if (creator?.choodles?.length > 0) { // TODO: figure out the appropriate test for game participation
      hasCreatedAChallenge = true;
    }
  })
</script>

<MetaData
  title="Choodle w/ Friends: DEFcon Edition"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer>
  {#if !hasCreatedAChallenge}
    <p>you haven't tried drawing anything yet</p>
    <Button variant="primary" colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
  {:else}
    <div>
      <Button colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
    </div>

    <header>
      <h3>myname</h3>
      <h3>42 points</h3>
    </header>
  {/if}

  <nav>
    <strong>leaderboard</strong>
    <span>my games</span>
    <span>rules</span>
  </nav>

  <leaderboard>
    <h3>leaderboard</h3>
    <ul>
      <li>
        <time>some time ago</time>
        <span>9001</span>
        <span>playerhandle</span>
      </li>
    </ul>
  </leaderboard>

  <games-list>
    <h3>games</h3>
    <ul>
      <li>
        <span>status</span>
        <time>20:23:00</time>
        <span>playerhandle</span>
      </li>
    </ul>
  </games-list>
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
