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
  import type { StreakGuessingGamePlayer } from '$lib/CWFGame'
  import type { PageData } from '../../.svelte-kit/types/src/routes'
  import { guessPath, pickPath, sharePath } from '$lib/routes'
  import { toHTML } from '@portabletext/to-html'
  import { readOnlyClient } from '$lib/CMSUtils'
  import map from 'lodash/fp/map'
  import isEmpty from 'lodash/fp/isEmpty'
  import orderBy from 'lodash/fp/orderBy'
  import DashboardDrawing from '../components/DashboardDrawing.svelte'

  loading.set(true)

  export let data: PageData

  let currentChoodler: StreakGuessingGamePlayer
  let challenges = []

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

  onMount(async () => {
    const usernameFetch = getUsername()
    const deviceIdFetch = getDeviceId()
    const creatorFetch = locateCreator({
      username: await usernameFetch,
      deviceId: await deviceIdFetch,
    }) // TODO: migrate global creator/player state to a store shared across pages

    currentChoodler = await creatorFetch

    challenges = orderBy(
      ['_updatedAt'],
      ['desc'],
      [
        ...(await readOnlyClient.fetch(
          `*[_type == "challenge" && challenger._ref == $creatorId]{..., challenger->{...}, choodle->{...}} | order(_createdAt desc)`,
          { creatorId: currentChoodler._id }
        )),
        ...map(
          (guess) => guess.challenge,
          await readOnlyClient.fetch(
            `*[_type == "guess" && guesser._ref == $creatorId]{..., challenge->{..., challenger->{...}, choodle->{...}}} | order(_createdAt desc)`,
            { creatorId: currentChoodler._id }
          )
        ),
      ]
    )
    console.log(challenges)

    loading.set(false)
  })
</script>

<MetaData title={data.copy.defaultPageTitle} themeColor={pageBackgroundDefault} url={$page.url} />

{#if isFirstTime}
  <LayoutContainer>
    <p class="hud">
      {#if currentChoodler?.username?.length}
        Hi, <span class="username">{currentChoodler?.username || 'unnamed user'}</span>!
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
      {#if currentChoodler?.username?.length}
        Hi, <span class="username">{currentChoodler?.username || 'unnamed user'}</span>!
      {:else}
        Hi!
      {/if}
    </p>

    <section class="landing-content">
      {@html toHTML(data.copy.landing_content)}

      {@html toHTML(data.copy.landing_content_bottom)}
    </section>

    <section class="drawings">
      {#each challenges as challenge}
        <DashboardDrawing
          challengeId={challenge._id}
          drawing={challenge.choodle}
          linkDestination={shareOrPickPathFor(currentChoodler._id, challenge)}
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
