<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Button from '../../../components/Button.svelte';
  import { getDeviceId, getEmail, getUsername, locateCreator } from '$lib/CreatorUtils';
  import LayoutContainer from '../../../components/LayoutContainer.svelte';
  import { page } from '$app/stores';
  import MetaData from '../../../components/MetaData.svelte';
  import { pageBackgroundDefault } from '$lib/Configuration';
  import { writable } from 'svelte/store';
  import fp from 'lodash/fp';
  import { toHTML } from '@portabletext/to-html';
  import { loading } from '$lib/store';
  import { urlFor } from '$lib/PersistedImagesUtils';
  import { isGameComplete } from '$lib/CWFGame';
  import DashboardGameEntry from './DashboardGameEntry.svelte';

  export let data;
  let currentChoodler;
  let hasCreatedAChallenge = false;
  let currentChoodlerChallenges;

  let myGames = [];

  const navItems = ['my games', 'rules'];
  let activeTab = writable(navItems[0]);

  const startGame = async () => {
    await goto(`/game/cwf/pick`);
  };

  let myTurnGames = [];
  let theirTurnGames = [];
  $: [myTurnGames, theirTurnGames] = fp.partition(isMyTurn, fp.reject(isGameComplete, myGames));

  const isMyTurn = (game) => {
    if (
      game.currentChallenge?.challenger?._id !== currentChoodler._id &&
      game.currentChallenge?.choodle
    )
      return true;
    if (
      game.currentChallenge?.challenger?._id === currentChoodler._id &&
      !game.currentChallenge?.choodle
    )
      return true;

    return false;
  };

  const sortedByCreatedAt = (thingsWithCreatedAt) => {
    return fp.sortBy(['createdAt'], thingsWithCreatedAt);
  };

  const gameFromChallenge = (challenge) => {
    return {
      _id: challenge._id,
      currentChallenge: { ...challenge, challenger: currentChoodler },
      guessResults: [],
      createdAt: challenge.createdAt,
    };
  };

  const filterGamesByPlayer = ({ _id }) =>
    fp.filter((game) => game?.player1?._id === _id || game?.player2?._id === _id);
  const sortedGuessResults = (game) => ({
    ...game,
    guessResults: sortedByCreatedAt(game.guessResults),
  });

  onMount(async () => {
    loading.set(true);

    const emailFetch = getEmail();
    const usernameFetch = getUsername();
    const deviceIdFetch = getDeviceId();
    const creatorFetch = locateCreator({
      email: await emailFetch,
      username: await usernameFetch,
      deviceId: await deviceIdFetch,
    }); // TODO: migrate global creator/player state to a store shared across pages

    currentChoodler = await creatorFetch;

    if (currentChoodler?.choodles?.length > 0) {
      // TODO: figure out the appropriate test for game participation
      hasCreatedAChallenge = true;
    } else {
      loading.set(false);
      return; // Don't load leaderboard stuff if player can't see it anyway
    }

    currentChoodlerChallenges = fp.filter(
      (c) => c.challenger && c.challenger._id === currentChoodler._id,
      data.challenges
    );

    myGames = sortedByCreatedAt([
      ...fp.map(sortedGuessResults, filterGamesByPlayer(currentChoodler)(data.games)),
      ...fp.map(gameFromChallenge, currentChoodlerChallenges),
    ]);
    console.log(`myGames`, myGames);

    loading.set(false);
  });
</script>

<MetaData title={data.copy.defaultPageTitle} themeColor={pageBackgroundDefault} url={$page.url} />

<LayoutContainer>
  {#if !hasCreatedAChallenge}
    <img src={urlFor(data.copy.logoTwo).url()} width="80%" style="margin: 3rem auto;" alt="" />

    {@html toHTML(data.copy.landing_content)}

    <Button variant="primary" colour="yellow" on:click={startGame} style="margin: 3rem auto;"
      >{data.copy.startGameButtonText}</Button
    >
  {:else}
    <div>
      <img src={urlFor(data.copy.logoTwo).url()} width="80%" alt="" />
    </div>

    <nav>
      {#each navItems as navItem}
        <span
          on:click={() => {
            activeTab.set(navItem);
          }}
          class={`${navItem == $activeTab ? 'active' : ''}`}
        >
          {navItem}
        </span>
      {/each}
    </nav>

    {#if $activeTab === 'my games'}
      <section class="tabContent my-games">
        <span class="game-list-heading">Your Turn</span>
        {#each myTurnGames as myTurnGame (myTurnGame._id)}
          <DashboardGameEntry
            {currentChoodler}
            game={myTurnGame}
            gameListUserUnknownText={data.copy.gameListUserUnknownText}
          />
        {:else}
          <div class="centre-container">
            <p>All caught up</p>
          </div>
        {/each}
        <div class="centre-container">
          <Button
            variant="secondary"
            colour="yellow"
            on:click={startGame}
            style="margin: 1rem auto; flex-grow: 0;"
          >
            {data.copy.startGameButtonText}
          </Button>
        </div>
        <span class="game-list-heading">Their Turn</span>
        {#each theirTurnGames as theirTurnGame (theirTurnGame._id)}
          <DashboardGameEntry
            {currentChoodler}
            game={theirTurnGame}
            gameListUserUnknownText={data.copy.gameListUserUnknownText}
          />
        {:else}
          <div class="centre-container">
            <p>Your challenges to other players will show up here.</p>
          </div>
        {/each}
      </section>
    {/if}

    {#if $activeTab === 'rules'}
      {@html toHTML(data.copy.rules_content)}
    {/if}
  {/if}
</LayoutContainer>

<style>
  .centre-container {
    display: flex;
    align-items: center;
    justify-content: center;
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

  .game-list-heading {
    /* mobile/caption-bold */
    font-family: DejaVu Sans Bold;
    font-size: 14px;
    font-style: normal;
    font-weight: bold;
    line-height: 120%; /* 16.8px */
    display: block;
    width: 100%;
    border-bottom: 1px solid var(--choodle-black);
    padding: 0.5rem 0;
  }

  .highlight {
    background: var(--choodle-yellow);
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
