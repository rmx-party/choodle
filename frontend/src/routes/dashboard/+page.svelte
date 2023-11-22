<script lang="ts">
  import { goto } from '$app/navigation'
  import { getContext } from 'svelte'
  import Button from '../../components/Button.svelte'
  import LayoutContainer from '../../components/LayoutContainer.svelte'
  import { navigating, page } from '$app/stores'
  import MetaData from '../../components/MetaData.svelte'
  import { pageBackgroundDefault } from '$lib/Configuration'
  import { loading } from '$lib/store'
  import type {
    StreakGuessingGameChallenge,
    StreakGuessingGameGuessResult,
    StreakGuessingGamePlayer,
  } from '$lib/CWFGame'
  import { guessPath, pickPath, sharePath } from '$lib/routes'
  import { toHTML } from '@portabletext/to-html'
  import { readOnlyClient } from '$lib/CMSUtils'
  import map from 'lodash/fp/map'
  import isEmpty from 'lodash/fp/isEmpty'
  import orderBy from 'lodash/fp/orderBy'
  import DashboardDrawing from '../../components/DashboardDrawing.svelte'
  import type { PageData } from './$types'
  import type { Writable } from 'svelte/store'
  import flow from 'lodash/fp/flow'
  import uniqBy from 'lodash/fp/uniqBy'
  import reject from 'lodash/fp/reject'
  import { urlFor } from '$lib/PersistedImagesUtils'
  import UserWelcomeMessage from '../../components/UserWelcomeMessage.svelte'

  loading.set(true)

  export let data: PageData

  let challenges: StreakGuessingGameChallenge[] = []

  const currentChoodler: Writable<StreakGuessingGamePlayer> = getContext('choodler')
  $: console.log(`dashboard page react`, { currentChoodler: $currentChoodler })

  let isFirstTime: boolean
  $: isFirstTime = !$loading && !$navigating && isEmpty(challenges)

  const startGame = async () => {
    await goto(pickPath())
  }

  const shareOrPickPathFor = (choodlerId, challenge) => {
    if (!choodlerId) return guessPath(challenge._id)

    if (choodlerId !== challenge.challenger._id) {
      return guessPath(challenge._id)
    }
    return sharePath(challenge._id)
  }

  let myChallenges: StreakGuessingGameChallenge[] = []
  let myGuesses: StreakGuessingGameGuessResult[] = []
  const fetchChoodlerChallenges = async (choodlerId: string) => {
    $loading || loading.set(true)
    if (!choodlerId) return
    myChallenges = (await readOnlyClient.fetch(
      `*[_type == "challenge" && challenger._ref == $choodlerId]{..., challenger->{...}, choodle->{...}} | order(_createdAt desc)`,
      { choodlerId }
    )) as StreakGuessingGameChallenge[]
    myGuesses = (await readOnlyClient.fetch(
      `*[_type == "guess" && guesser._ref == $choodlerId]{..., challenge->{..., challenger->{...}, choodle->{...}}} | order(_createdAt desc)`,
      { choodlerId }
    )) as StreakGuessingGameGuessResult[]
    loading.set(false)
  }
  $: {
    challenges = flow(
      reject((challenge: StreakGuessingGameChallenge) => !challenge.choodle),
      orderBy(['_updatedAt'], ['desc']),
      uniqBy('_id')
    )([
      ...myChallenges,
      ...map((guess) => guess.challenge, myGuesses),
    ] as StreakGuessingGameChallenge[])
  }
  $: {
    !$navigating && $currentChoodler?._id && fetchChoodlerChallenges($currentChoodler._id)
  }
</script>

<MetaData
  title={data.pageContent.pageTitle}
  description={data.pageContent.pageDescription}
  url={$page.url}
  bgColor={pageBackgroundDefault}
/>

{#if isFirstTime}
  <LayoutContainer>
    <UserWelcomeMessage />

    <section class="block-content">
      {@html toHTML(data.copy.landing_content_first_time)}
    </section>

    {#if data.copy.landing_image}
      <section>
        <!-- <img src={urlFor(data.copy.landing_image).url()} alt="" /> -->
        <video
          src={'https://cdn.sanity.io/files/tdnjp9se/staging/72b3d915437456c9640ecdd17bd4662abfd17f52.mp4'}
          autoplay
          loop
          muted
          playsinline
          disablepictureinpicture
        ></video>
      </section>
    {/if}

    <Button
      id="dashboard-first-start-game-btn"
      variant="primary"
      colour="yellow"
      on:click={startGame}
      style="width: 100%; margin: 1rem auto; flex-grow: 0;"
    >
      {data.copy.startGameButtonText}
    </Button>

    <section class="block-content">
      {@html toHTML(data.copy.landing_content_bottom)}
    </section>
  </LayoutContainer>
{:else}
  <LayoutContainer>
    <UserWelcomeMessage />

    <section class="block-content">
      {@html toHTML(data.copy.landing_content)}
    </section>

    <section class="drawings">
      {#each challenges as challenge, index (challenge._id)}
        <DashboardDrawing
          {index}
          drawing={challenge.choodle}
          linkDestination={shareOrPickPathFor($currentChoodler?._id, challenge)}
        />
      {/each}
    </section>

    <section class="block-content">
      {@html toHTML(data.copy.landing_content_bottom)}
    </section>
  </LayoutContainer>
{/if}

<style>
  section {
    margin: 1.5rem auto 0;
  }
  .block-content:last-child {
    padding-bottom: 2rem;
  }

  .drawings {
    width: calc(
      (var(--drawing-grid-img-width) * var(--drawing-grid-columns)) +
        (var(--drawing-grid-gap) * (var(--drawing-grid-columns) - 1))
    );
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: var(--drawing-grid-gap);
    margin: 2rem auto;
  }

  @media (min-width: 550px) {
    .drawings {
      --drawing-grid-columns: 3;
    }
  }

  video {
    max-height: 30svh;
  }
</style>
