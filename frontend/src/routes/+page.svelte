<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import Button from '../components/Button.svelte'
  import { getDeviceId, getUsername, locateCreator } from '$lib/CreatorUtils'
  import LayoutContainer from '../components/LayoutContainer.svelte'
  import { page } from '$app/stores'
  import MetaData from '../components/MetaData.svelte'
  import { pageBackgroundDefault } from '$lib/Configuration'
  import { loading } from '$lib/store'
  import type { StreakGuessingGameChallenge, StreakGuessingGamePlayer } from '$lib/CWFGame'
  import type { PageData } from '../../.svelte-kit/types/src/routes'
  import { pickPath } from '$lib/routes'
  import { toHTML } from '@portabletext/to-html'
  import { readOnlyClient } from '$lib/CMSUtils'
  import map from 'lodash/fp/map'
  import isEmpty from 'lodash/fp/isEmpty'

  loading.set(true)

  export let data: PageData

  let currentChoodler: StreakGuessingGamePlayer
  let challenges = []

  let isFirstTime: boolean
  $: isFirstTime = isEmpty(challenges)

  const startGame = async () => {
    await goto(pickPath())
  }

  onMount(async () => {
    const usernameFetch = getUsername()
    const deviceIdFetch = getDeviceId()
    const creatorFetch = locateCreator({
      username: await usernameFetch,
      deviceId: await deviceIdFetch,
    }) // TODO: migrate global creator/player state to a store shared across pages

    currentChoodler = await creatorFetch

    challenges = [
      ...(await readOnlyClient.fetch(
        `*[_type == "challenge" && challenger._ref == $creatorId]{..., choodle->{...}} | order(_createdAt desc)`,
        { creatorId: currentChoodler._id }
      )),
      ...map(
        (guess) => guess.challenge,
        await readOnlyClient.fetch(
          `*[_type == "guess" && guesser._ref == $creatorId]{..., challenge->{..., choodle->{...}}} | order(_createdAt desc)`,
          { creatorId: currentChoodler._id }
        )
      ),
    ]
    console.log(challenges)

    loading.set(false)
  })
</script>

<MetaData title={data.copy.defaultPageTitle} themeColor={pageBackgroundDefault} url={$page.url} />

{#if isFirstTime}
  <LayoutContainer>
    {@html toHTML(data.copy.landing_content)}

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

    {@html toHTML(data.copy.landing_content_bottom)}
  </LayoutContainer>
{:else}
  <LayoutContainer>
    <p class="hud">
      {#if currentChoodler?.username?.length}
        Hi, <span class="username">{currentChoodler?.username || 'unnamed user'}</span>!
      {:else}
        Hi!
      {/if}
    </p>
  </LayoutContainer>
{/if}

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
