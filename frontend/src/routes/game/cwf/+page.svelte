<script lang="ts">
  import {goto} from '$app/navigation';
  import {onMount} from 'svelte';
  import Button from '../../../components/Button.svelte';
  import {getDeviceId, getEmail, getUsername, locateCreator} from '$lib/CreatorUtils';
  import LayoutContainer from '../../../components/LayoutContainer.svelte';
  import {page} from '$app/stores';
  import MetaData from '../../../components/MetaData.svelte';
  import {pageBackgroundDefault} from '$lib/Configuration';
  import {writable} from 'svelte/store';
  import fp from 'lodash/fp';
  import {toHTML} from '@portabletext/to-html';
  import {loading} from '$lib/store';
  import {urlFor} from '$lib/PersistedImagesUtils';
  import type {
    SanityDocumentMetadata,
    StreakGuessingGame,
    StreakGuessingGamePlayer,
  } from '$lib/CWFGame';
  import {isPlayerInGame, whoseTurn} from '$lib/CWFGame';
  import DashboardGameEntry from './DashboardGameEntry.svelte';
  import {GameBuilder} from "$lib/GameBuilder";

  export let data;
  let currentChoodler: StreakGuessingGamePlayer;
  let hasDismissedStartScreen = false;

  let myGames: StreakGuessingGame[] = [];

  const navItems = ['my games', 'rules'];
  let activeTab = writable(navItems[0]);

  const startGame = async () => {
    await goto(`/game/cwf/pick`);
  };

  let myTurnGames: StreakGuessingGame[] = [];
  let theirTurnGames: StreakGuessingGame[] = [];
  $: [myTurnGames, theirTurnGames] = fp.partition(isMyTurn, myGames);


  let challengesInGames
  let currentPlayerChallenges

  const challengesInGame = (game: StreakGuessingGame) => {
    return fp.map(guessResult => guessResult.challenge, game.guessResults)
  }

  const isMyTurn = (game) => {
    if (!game.player2) return game.player2

    return whoseTurn(game)._id === currentChoodler._id;
  };

  const sortedByCreatedAt = (thingsWithCreatedAt: SanityDocumentMetadata[]): SanityDocumentMetadata[] => {
    return fp.reverse(fp.sortBy(['_createdAt'], thingsWithCreatedAt))
  }

  const sortGuessResults = (game): StreakGuessingGame => ({
    ...game,
    guessResults: sortedByCreatedAt(game.guessResults),
  });

  onMount(async () => {
    loading.set(true)

    const emailFetch = getEmail();
    const usernameFetch = getUsername();
    const deviceIdFetch = getDeviceId();
    const creatorFetch = locateCreator({
      email: await emailFetch,
      username: await usernameFetch,
      deviceId: await deviceIdFetch,
    }); // TODO: migrate global creator/player state to a store shared across pages

    currentChoodler = await creatorFetch;

    // FIXME: make it so player is always here when we call isPlayerInGame
    myGames = fp.map(sortGuessResults,
      fp.filter(game => isPlayerInGame(game, currentChoodler), (data.games)))
    console.log(`myGames`, myGames);

    challengesInGames = fp.flatMapDeep(challengesInGame, myGames)
    currentPlayerChallenges = fp.filter(challenge => challenge.challenger?._id === currentChoodler._id, data.challenges)

    const unAnsweredChallenges = fp.difference(currentPlayerChallenges, challengesInGames)

    const unAnsweredGames = fp.map(builder => builder.build, fp.map(GameBuilder.fromChallenge, unAnsweredChallenges))
    myGames = sortedByCreatedAt([...unAnsweredGames, ...myGames])

    loading.set(false);
  });
</script>

<MetaData title={data.copy.defaultPageTitle} themeColor={pageBackgroundDefault} url={$page.url}/>

<LayoutContainer>
  {#if !hasDismissedStartScreen}
    <img src={urlFor(data.copy.logoTwo).url()} width="80%" style="margin: 3rem auto;" alt=""/>

    {@html toHTML(data.copy.landing_content)}

    <Button variant="primary" colour="yellow" on:click={() => {hasDismissedStartScreen = true}}
            style="margin: 3rem auto;">{data.copy.dismissStartScreenButtonText}</Button>
  {:else}
    <div>
      <img src={urlFor(data.copy.logoTwo).url()} width="80%" alt=""/>
    </div>

    <section class="nav-and-hud">
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

      <span class="username">{currentChoodler.username}</span>
    </section>

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

  .nav-and-hud {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
  }

  nav {
    align-self: flex-start;
    display: block;
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

  .username {
    display: inline-block;
    text-align: right;
    color: var(--text-text-primary, #141518);
    background: var(--colors-brand-choodle-yellow, #fef40a);

    /* mobile/caption-bold */
    font-family: DejaVu Sans Bold;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 1.05rem */
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
</style>
