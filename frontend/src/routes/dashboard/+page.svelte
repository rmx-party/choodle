<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import Button from '../../components/Button.svelte'
  import { getDeviceId, getUsername, locateCreator } from '$lib/CreatorUtils'
  import LayoutContainer from '../../components/LayoutContainer.svelte'
  import { page } from '$app/stores'
  import MetaData from '../../components/MetaData.svelte'
  import { pageBackgroundDefault } from '$lib/Configuration'
  import fp from 'lodash/fp'
  import { loading } from '$lib/store'
  import type {
    SanityDocumentMetadata,
    StreakGuessingGame,
    StreakGuessingGamePlayer,
  } from '$lib/CWFGame'
  import { isPlayerInGame, otherPlayer } from '$lib/CWFGame'
  import DashboardGameEntry from '../../components/DashboardGameEntry.svelte'

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
    return fp.reverse(fp.sortBy(['_createdAt'], thingsWithCreatedAt))
  }

  const sortGuessResults = (game): StreakGuessingGame => ({
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

    // // TODO: refactor to use flow style
    myGames = fp.compose(
      fp.reverse,
      fp.uniqBy((game) => otherPlayer(currentChoodler, game).username),
      fp.sortBy(['_createdAt']),
      fp.map(sortGuessResults),
      fp.filter((game) => isPlayerInGame(game, currentChoodler)),
      fp.reject((game) => !game?.player2?.username)
    )(data.games as StreakGuessingGame[])

    console.log(`myGames`, myGames)

    loading.set(false)
  })
</script>

<MetaData title={data.copy.defaultPageTitle} themeColor={pageBackgroundDefault} url={$page.url} />

<LayoutContainer>
  <section class="hud">
    <span class="username">{currentChoodler?.username || 'unnamed user'}</span>
  </section>

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
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    margin-top: 2rem;
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
</style>
