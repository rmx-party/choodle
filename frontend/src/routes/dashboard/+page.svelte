<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import Button from '../../components/Button.svelte'
  import { getDeviceId, getUsername, locateCreator } from '$lib/CreatorUtils'
  import LayoutContainer from '../../components/LayoutContainer.svelte'
  import { page } from '$app/stores'
  import MetaData from '../../components/MetaData.svelte'
  import { pageBackgroundDefault } from '$lib/Configuration'
  import filter from 'lodash/fp/filter'
  import reject from 'lodash/fp/reject'
  import uniqBy from 'lodash/fp/uniqBy'
  import map from 'lodash/fp/map'
  import orderBy from 'lodash/fp/orderBy'
  import flow from 'lodash/fp/flow'
  import { loading } from '$lib/store'
  import type {
    SanityDocumentMetadata,
    StreakGuessingGame,
    StreakGuessingGamePlayer,
  } from '$lib/CWFGame'
  import { isPlayerInGame, otherPlayer } from '$lib/CWFGame'
  import DashboardGameEntry from '../../components/DashboardGameEntry.svelte'
  import type { PageData } from './$types'

  loading.set(true)

  export let data: PageData

  let currentChoodler: StreakGuessingGamePlayer
  let myGames: StreakGuessingGame[] = []

  const startGame = async () => {
    await goto(`/`)
  }

  const sortedByCreatedAt = (
    thingsWithCreatedAt: SanityDocumentMetadata[]
  ): SanityDocumentMetadata[] => {
    return orderBy(['_createdAt'], ['desc'], thingsWithCreatedAt)
  }

  const sortGuessResults = (game: StreakGuessingGame): StreakGuessingGame => ({
    ...game,
    guessResults: sortedByCreatedAt(game.guessResults),
  })

  onMount(async () => {
    const usernameFetch = getUsername()
    const deviceIdFetch = getDeviceId()
    const creatorFetch = locateCreator({
      username: await usernameFetch,
      deviceId: await deviceIdFetch,
    }) // TODO: migrate global creator/player state to a store shared across pages

    currentChoodler = await creatorFetch

    myGames = flow(
      map(sortGuessResults),
      reject((game) => !game?.player2?.username),
      filter((game) => isPlayerInGame(game, currentChoodler)),
      orderBy(['_createdAt'], ['desc']),
      uniqBy((game) => otherPlayer(currentChoodler, game).username)
    )(data.games as StreakGuessingGame[])

    console.log({ myGames })

    loading.set(false)
  })
</script>

<MetaData title={data.copy.defaultPageTitle} themeColor={pageBackgroundDefault} url={$page.url} />

<LayoutContainer>
  <p class="hud">
    {#if currentChoodler?.username?.length}
      Hi, <span class="username">{currentChoodler?.username || 'unnamed user'}</span>!
    {:else}
      Hi!
    {/if}
  </p>

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

  {#each myGames as myGame (myGame._id)}
    <DashboardGameEntry
      {currentChoodler}
      game={myGame}
      gameListUserUnknownText={data.copy.gameListUserUnknownText}
    />
  {:else}
    <div class="centre-container">
      <p>All caught up</p>
    </div>
  {/each}
</LayoutContainer>

<style>
  .centre-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hud {
    width: 100%;
    margin-top: 2rem;
  }

  .username {
    display: inline-block;
    text-align: right;
    color: var(--text-text-primary, #141518);
    background: var(--choodle-yellow, #fef40a);

    /* mobile/caption-bold */
    font-family: DejaVu Sans Bold;
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 700;
    line-height: 120%; /* 1.05rem */
  }
</style>
