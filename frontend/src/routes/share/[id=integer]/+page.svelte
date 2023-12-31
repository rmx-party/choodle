<script lang="ts">
  import Button from '../../../components/Button.svelte'
  import { goto, preloadData } from '$app/navigation'
  import { page } from '$app/stores'
  import MetaData from '../../../components/MetaData.svelte'
  import { getContext, onMount } from 'svelte'
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
  import type { User } from '@prisma/client'

  loading.set(true)

  export let data: PageData

  const currentChoodler: Writable<User> = getContext('choodler')

  let choodleOwner = true
  $: choodleOwner = data.challenge.userId === $currentChoodler?.id
  $: {
    if (browser && $currentChoodler && !choodleOwner) {
      console.log(`not the choodle owner, going to guess page`, data, $currentChoodler)
      goto(guessPath(data.challenge.id))
    }
  }

  let copiedToClipboard = false

  $: gamePrompt = data.challenge?.prompt
  let gamePromptTiles = ''
  $: {
    gamePromptTiles = gamePrompt?.length
      ? map((char) => (char === ' ' ? '⬜' : '🟨'), gamePrompt.split('')).join('')
      : ''
  }

  $: shareUrl = browser ? `${window.location.origin}/guess/${data.challenge.id}` : ''
  $: challengeShareText = [data.copy.share_messageText, shareUrl].join(`\n`)
  let challengeShareable: Shareable
  $: challengeShareable = { text: challengeShareText }

  const handleShare = async (event: Event) => {
    event.preventDefault()
    if (!browser) return

    share(challengeShareable, (usedClipboard) => {
      copiedToClipboard = usedClipboard
    })
      .then((result) => {
        // send a ga event for share
        if (browser) {
          window?.gtag('event', 'click', {
            event_category: 'engagement',
            event_label: 'share_challenge',
            prompt_text: gamePrompt,
          })
        }

        console.log(`shared`, { result })
      })
      .catch((error) => {
        // add ga event for share cancellation
        if (browser) {
          window?.gtag('event', 'click', {
            event_category: 'engagement',
            event_label: 'share_challenge_cancel',
            prompt_text: gamePrompt,
          })
        }

        console.error(`error sharing`, error)
      })
  }

  onMount(async () => {
    // Store in localstorage on Draw:
    //  - all details we need to draw it here, including the image

    loading.set(false)
    preloadData(guessPath(data.challenge.id))
  })
</script>

<MetaData
  url={$page.url}
  title={data.pageContent.pageTitle}
  description={data.pageContent.pageDescription}
  imageUrl={data.challenge.drawing.imageUrl}
  width="430"
  height="932"
  themeColor={choodleYellow}
  bgColor={pageBackgroundDefault}
/>

<LayoutContainer class="no-pan">
  <section class="top-content block-content">
    {@html toHTML(data.copy.guess_pageAuthorTopContent)}
  </section>

  <ChoodleContainer --choodle-max-height-offset="27rem">
    <img src={data.challenge.drawing.imageUrl} alt="" />
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
