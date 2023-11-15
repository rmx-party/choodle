<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils'
  import Button from '../../../components/Button.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import MetaData from '../../../components/MetaData.svelte'
  import { getContext, onMount } from 'svelte'
  import { getDeviceId, locateCreator } from '$lib/CreatorUtils'
  import { share, type Shareable } from '$lib/ShareUtils'
  import { browser } from '$app/environment'
  import map from 'lodash/fp/map'
  import { toHTML } from '@portabletext/to-html'
  import { choodleYellow, pageBackgroundDefault } from '$lib/Configuration'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ChoodleContainer from '../../../components/ChoodleContainer.svelte'
  import { loading } from '$lib/store'
  import type { PageData } from './$types'
  import { guessPath } from '$lib/routes'
  import type { Writable } from 'svelte/store'
  import type { StreakGuessingGamePlayer } from '$lib/CWFGame'

  loading.set(true)

  export let data: PageData

  const currentChoodler: Writable<StreakGuessingGamePlayer> = getContext('choodler')

  let choodleOwner = true
    $: choodleOwner = data.challenge.challenger._id === $currentChoodler?._id
  $: {
    if (!choodleOwner) {
      goto(guessPath(data.challenge._id))
    }
  }

  let copiedToClipboard = false

    $: gamePrompt = data.challenge?.gamePrompt?.prompt
  let gamePromptTiles = ''
    $: {
    gamePromptTiles = gamePrompt?.length
      ? map((char) => (char === ' ' ? '⬜' : '🟨'), gamePrompt.split('')).join('')
      : ''
  }

    $: shareUrl = browser ? `${window.location.origin}/guess/${data.challenge._id}` : ''
  $: challengeShareText = [data.copy.share_messageText, gamePromptTiles, shareUrl].join(`\n`)
  let challengeShareable: Shareable
  $: challengeShareable = { text: challengeShareText}

  const handleShare = async (event: Event) => {
    event.preventDefault()
    if (!browser) return

    share(challengeShareable, (usedClipboard) => {
      copiedToClipboard = usedClipboard
    })
  }

  onMount(async () => {

    // Store in localstorage on Draw:
    //  - all details we need to draw it here, including the image

    loading.set(false)
  })

  const bestImageUrl = (choodle) => {
    let bestImage = choodle.upScaledImage

    if (!bestImage) {
      bestImage = choodle.image
    }

    return urlFor(bestImage).url()
  }
</script>

<MetaData
  url={$page.url}
  title={data.copy.defaultPageTitle}
  imageUrl={bestImageUrl(data.challenge.choodle)}
  width="430"
  height="932"
  themeColor={choodleYellow}
  bgColor={pageBackgroundDefault}
/>

<LayoutContainer class="no-pan">
  <section class="top-content">
    {@html toHTML(data.copy.guess_pageAuthorTopContent)}
  </section>

  <ChoodleContainer --choodle-max-height-offset="27rem">
    <img src={bestImageUrl(data.challenge.choodle)} alt="" />
  </ChoodleContainer>

  <Button variant="primary" colour="yellow" on:click={handleShare}
    >{copiedToClipboard ? data.copy.guess_copiedToClipboard : data.copy.share_buttonText}</Button
  >
</LayoutContainer>

<style>
  .top-content {
    margin: 2rem 0 1rem;
  }
  :global(.primary) {
    margin-top: 3rem;
  }
</style>
