<script lang="ts">
  import { goto } from '$app/navigation'
  import { getContext, onMount } from 'svelte'
  import Button from '../components/Button.svelte'
  import LayoutContainer from '../components/LayoutContainer.svelte'
  import { page } from '$app/stores'
  import MetaData from '../components/MetaData.svelte'
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
  import DashboardDrawing from '../components/DashboardDrawing.svelte'
  import type { PageData } from './$types'
  import type { Writable } from 'svelte/store'

  loading.set(true)

  export let data: PageData

  let challenges: StreakGuessingGameChallenge[] = []

  const currentChoodler: Writable<StreakGuessingGamePlayer> = getContext('choodler')
  $: console.log(`dashboard page react`, { currentChoodler: $currentChoodler })

  let isFirstTime: boolean
  $: isFirstTime = isEmpty(challenges)

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
    if (!choodlerId) return
    myChallenges = (await readOnlyClient.fetch(
      `*[_type == "challenge" && challenger._ref == $choodlerId]{..., challenger->{...}, choodle->{...}} | order(_createdAt desc)`,
      { choodlerId }
    )) as StreakGuessingGameChallenge[]
    myGuesses = (await readOnlyClient.fetch(
      `*[_type == "guess" && guesser._ref == $choodlerId]{..., challenge->{..., challenger->{...}, choodle->{...}}} | order(_createdAt desc)`,
      { choodlerId }
    )) as StreakGuessingGameGuessResult[]
  }
  $: {
    challenges = orderBy(
      ['_updatedAt'],
      ['desc']
    )([
      ...myChallenges,
      ...map((guess) => guess.challenge, myGuesses),
    ]) as StreakGuessingGameChallenge[]
  }
  $: $currentChoodler?._id && fetchChoodlerChallenges($currentChoodler._id)

  onMount(async () => {
    loading.set(false)
  })
</script>

<MetaData title={data.copy.defaultPageTitle} bgColor={pageBackgroundDefault} url={$page.url} />

{#if isFirstTime}
  <LayoutContainer>
    <p class="hud">
      {#if $currentChoodler?.username?.length}
        Hi, <span class="username">{$currentChoodler?.username || 'unnamed user'}</span>!
      {:else}
        Hi!
      {/if}
    </p>

    <section class="landing-content">
      {@html toHTML(data.copy.landing_content_first_time)}
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

    <section class="landing-content">
      {@html toHTML(data.copy.landing_content_bottom)}
    </section>
  </LayoutContainer>
{:else}
  <LayoutContainer>
    <p class="hud">
      {#if $currentChoodler?.username?.length}
        Hi, <span class="username">{$currentChoodler?.username || 'unnamed user'}</span>!
      {:else}
        Hi!
      {/if}
    </p>

    <section class="landing-content">
      {@html toHTML(data.copy.landing_content)}

      {@html toHTML(data.copy.landing_content_bottom)}
    </section>

    <section class="drawings">
      {#each challenges as challenge (challenge._id)}
        <DashboardDrawing
          challengeId={challenge._id}
          drawing={challenge.choodle}
          linkDestination={shareOrPickPathFor($currentChoodler?._id, challenge)}
        />
      {/each}
    </section>
  </LayoutContainer>
{/if}

<style>
  section {
    margin-top: 1.5rem;
  }

  section.drawings {
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: flex-start;
    align-items: flex-start;
  }

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
