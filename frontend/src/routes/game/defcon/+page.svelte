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
  import { writable } from "svelte/store";

  export let data
  let creator
  let hasCreatedAChallenge = false

  const navItems = [
    'leaderboard',
    'my games',
    'rules'
  ]
  let activeTab = writable(navItems[0])

  // TODO: CMS-populate all the copy / non-dynamic html contents

  const startGame = async () => {
    await goto(`/game/defcon/pick`)
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
  {#if !hasCreatedAChallenge || !creator}
    <p>you haven't tried drawing anything yet</p>
    <Button variant="primary" colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
  {:else}
    <div>
      <Button colour="yellow" on:click={startGame}>{data.copy.startGameButtonText}</Button>
    </div>

    <header>
      <h3><strong>{creator.username}</strong></h3>
      <h3>42 points</h3>
    </header>

    <nav>
      {#each navItems as navItem }
        <span on:click={() => { activeTab.set(navItem)}}>
          {#if navItem == $activeTab}
            <strong>{navItem}</strong>
          {:else}
            {navItem}
          {/if}
        </span>
      {/each}
    </nav>

    <section class="tabContent">
      <ul>
        <li>
          <a href="">
            <time>some time ago</time>
            <span>9001</span>
            <span>playerhandle</span>
          </a>
        </li>
      </ul>
    </section>
  {/if}
</LayoutContainer>

<style>

  header {
    display: block;
    width: 100%;
    text-align: right;
  }
  nav {
    display: block;
    width: 100%;
    margin: 1rem 0;
    text-align: left;
  }
  nav > span {
    display: block;
    width: 100%;
  }
  nav > span + span {
    margin-top: 1rem;
  }

  .tabContent {
    display: block;
    width: 100%;
    text-align: left;
  }

  .tabContent ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
