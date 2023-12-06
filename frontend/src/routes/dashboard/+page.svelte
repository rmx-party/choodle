<script lang="ts">
  import { goto } from '$app/navigation'
  import { getContext } from 'svelte'
  import Button from '../../components/Button.svelte'
  import LayoutContainer from '../../components/LayoutContainer.svelte'
  import { page } from '$app/stores'
  import MetaData from '../../components/MetaData.svelte'
  import { pageBackgroundDefault } from '$lib/Configuration'
  import { addLoadingReason } from '$lib/store'
  import { guessPath, pickPath, sharePath } from '$lib/routes'
  import { toHTML } from '@portabletext/to-html'
  import map from 'lodash/fp/map'
  import isEmpty from 'lodash/fp/isEmpty'
  import orderBy from 'lodash/fp/orderBy'
  import DashboardDrawing from '../../components/DashboardDrawing.svelte'
  import type { PageData } from './$types'
  import type { Writable } from 'svelte/store'
  import flow from 'lodash/fp/flow'
  import uniqBy from 'lodash/fp/uniqBy'
  import reject from 'lodash/fp/reject'
  import type { Challenge, GuessResult, User } from '@prisma/client'
  import { getMyChallenges, getMyGuessResults } from '$lib/storage'

  export let data: PageData

  let challenges: Challenge[] = []

  const currentChoodler: Writable<User> = getContext('choodler')
  $: console.log(`dashboard page react`, { currentChoodler: $currentChoodler })

  let isFirstTime: boolean = false

  const startGame = async () => {
    await goto(pickPath())
  }

  const shareOrPickPathFor = (choodlerId, challenge) => {
    if (!choodlerId) return guessPath(challenge.id)

    if (choodlerId !== challenge.userId) {
      return guessPath(challenge.id)
    }
    return sharePath(challenge.id)
  }

  let myChallenges: Challenge[] = []
  let myGuesses: GuessResult[] = []
  const fetchMyChallengesAndGuesses = async (choodlerId: number) => {
    if (!choodlerId) return

    const pending = Promise.allSettled([
      getMyChallenges().then((challenges) => (myChallenges = challenges || [])),
      getMyGuessResults().then((guesses) => (myGuesses = guesses || [])),
    ])
    addLoadingReason('fetchMyChallengesAndGuesses', pending)
    await pending

    console.log({ myChallenges, myGuesses })
    isFirstTime = isEmpty(challenges)
  }

  $: {
    challenges = flow(
      reject((challenge: Challenge) => !challenge?.drawing?.imageUrl),
      orderBy(['updatedAt'], ['desc']),
      uniqBy('id')
    )([...myChallenges, ...map((gr) => gr.challenge, myGuesses)] as Challenge[])
  }
  $: {
    $currentChoodler?.id && fetchMyChallengesAndGuesses($currentChoodler.id)
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
    <section class="block-content">
      {@html toHTML(data.copy.landing_content)}
    </section>

    <section class="drawings">
      {#each challenges as challenge, index (challenge.id)}
        <DashboardDrawing
          {index}
          drawing={challenge.drawing}
          linkDestination={shareOrPickPathFor($currentChoodler?.id, challenge)}
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
    max-height: 60svh;
  }
</style>
