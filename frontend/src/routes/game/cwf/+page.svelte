<script lang="ts">
  import {goto} from "$app/navigation";
  import {onMount} from "svelte";
  import Button from "../../../components/Button.svelte";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import LayoutContainer from "../../../components/LayoutContainer.svelte";
  import {page} from "$app/stores";
  import MetaData from "../../../components/MetaData.svelte";
  import {pageBackgroundDefault} from "$lib/Configuration";
  import {writable} from "svelte/store";
  import {readOnlyClient} from "$lib/CMSUtils";
  import fp from "lodash/fp";
  import {toHTML} from "@portabletext/to-html";
  import {loading} from "$lib/store";
  import {urlFor} from "$lib/PersistedImagesUtils";
  import {normalizeGame, streakCount} from "$lib/CWFGame";

  export let data
  let currentChoodler
  let hasCreatedAChallenge = false

  let myGames = []

  const navItems = [
    'my games',
    'rules'
  ]
  let activeTab = writable(navItems[0])

  const startGame = async () => {
    await goto(`/game/cwf/pick`)
  }
  
  const myTurnGames = (games) => {
    return fp.filter((game) => {
      if (game.currentChallenge.challenger._id !== currentChoodler._id) return true

      return !game.currentChallenge.choodle;
    }, games)
  }

  const theirTurnGames = (games) => {
    return fp.filter((game) => {
      return game.currentChallenge.challenger._id === currentChoodler._id && game.currentChallenge.choodle;
    }, games)
  }

  const otherPlayerIn = (game) => {
    if (game.player1._id === currentChoodler._id) return game.player2.username || 'player2 unknown'
    return game.player1.username || 'player1 unknown'
  }

  onMount(async () => {
    const emailFetch = getEmail()
    const usernameFetch = getUsername()
    const deviceIdFetch = getDeviceId()
    const creatorFetch = locateCreator({
      email: await emailFetch,
      username: await usernameFetch,
      deviceId: await deviceIdFetch
    }); // TODO: migrate global creator/player state to a store shared across pages

    currentChoodler = await creatorFetch;
    console.log({creator: currentChoodler})

    if (currentChoodler?.choodles?.length > 0) { // TODO: figure out the appropriate test for game participation
      hasCreatedAChallenge = true;
    } else {
      loading.set(false)
      return // Don't load leaderboard stuff if player can't see it anyway
    }

    console.log(`games`, data.games)
    myGames = fp.filter((game) => {
      return game.player1._id === currentChoodler._id || game.player2._id === currentChoodler._id
    }, data.games)
    console.log(`myGames`, myGames)

    loading.set(false)
  })
</script>

<MetaData
  title="Choodle w/ Friends"
  themeColor={pageBackgroundDefault}
  url={$page.url}
/>

<LayoutContainer>
  {#if !hasCreatedAChallenge || !currentChoodler}
    <img src={urlFor(data.copy.logo).url()} width="80%" style="margin: 3rem auto;" alt=''/>

    {@html toHTML(data.copy.landing_content)}

    <Button variant="primary" colour="yellow" on:click={startGame}
            style="margin: 3rem auto;">{data.copy.startGameButtonText}</Button>
  {:else}
    <div>
      <img src={urlFor(data.copy.logo).url()} width="80%" alt=''/>
    </div>
    <header>
      <h3><strong>{currentChoodler.username}</strong></h3>
    </header>

    <Button variant="primary" colour="yellow" on:click={startGame}
            style="margin: 3rem auto;">{data.copy.startGameButtonText}</Button>

    <nav>
      {#each navItems as navItem }
        <span on:click={() => { activeTab.set(navItem)}} class={`${navItem == $activeTab ? 'active' : ''}`}>
          {navItem}
        </span>
      {/each}
    </nav>

    {#if $activeTab === "my games"}
      <section class="tabContent my-games">
        <p>My Turn</p>
        {#each myTurnGames(myGames) as myTurnGame}
          <p>{otherPlayerIn(myTurnGame)} {streakCount(normalizeGame(myTurnGame))}</p>
        {/each}
        <p>Their Turn</p>
        {#each theirTurnGames(myGames) as myTurnGame}
          <p>{otherPlayerIn(myTurnGame)} {streakCount(normalizeGame(myTurnGame))}</p>
        {/each}
      </section>
    {/if}

    {#if $activeTab === "rules"}
      {@html toHTML(data.copy.rules_content)}
    {/if}
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
    margin: 1rem 0 2rem;
    text-align: left;

    text-transform: capitalize;
    font-size: 18px;
    font-family: 'DejaVu Sans Bold';
    color: darkgrey;
  }

  nav > span {
    display: block;
    width: 100%;
  }

  nav > .active {
    color: var(--choodle-black);
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

  .highlight {
    background: var(--choodle-yellow)
  }

  table {
    width: 100%;
  }

  .my-games tr, nav > span {
    cursor: pointer;
  }

  .won {
    color: hsla(108, 90%, 28%, 1);
  }

  .lost {
    color: hsla(0, 100%, 21%, 1);
  }

  .status {
    text-align: center;
  }

  .username {
    text-align: right;
  }
</style>
