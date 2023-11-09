<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils'
  import TopBar from '../../../components/TopBar.svelte'
  import Button from '../../../components/Button.svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import MetaData from '../../../components/MetaData.svelte'
  import { onMount } from 'svelte'
  import { getDeviceId, getEmail, getUsername, locateCreator } from '$lib/CreatorUtils'
  import { share, type Shareable } from '$lib/ShareUtils'
  import { browser } from '$app/environment'
  import map from 'lodash/fp/map'
  import { toHTML } from '@portabletext/to-html'
  import { choodleYellow, pageBackgroundDefault } from '$lib/Configuration'
  import LayoutContainer from '../../../components/LayoutContainer.svelte'
  import ChoodleContainer from '../../../components/ChoodleContainer.svelte'
  import { loading, loadingMessage } from '$lib/store'
  import type { PageData } from './$types'

  loading.set(true)
  loadingMessage.set('loading')

  export let data: PageData

  let choodleOwner = false
  let copiedToClipboard = false

  let deviceId
  let email
  let username = ''
  let currentChoodler

  let gamePrompt

  const constructChallengeShareable = (): Shareable => {
    let gamePromptTiles = gamePrompt?.length
      ? map((char) => (char === ' ' ? '⬜' : '🟨'), gamePrompt.split('')).join('')
      : ''

    const url = `${window.location.origin}/guess/${data.challenge._id}`
    const shareCopy = data.copy.share_messageText || ''
    const text = [shareCopy, gamePromptTiles, url].join(`\n`)
    const shareable = { text }
    return shareable
  }

  const handleShare = async (event: Event) => {
    event.preventDefault()
    if (!browser) return

    share(constructChallengeShareable(), (usedClipboard) => {
      copiedToClipboard = usedClipboard
    })
  }

  onMount(async () => {
    deviceId = await getDeviceId()

    email = await getEmail()
    username = (await getUsername()) || ''
    currentChoodler = await locateCreator({ email, deviceId, username })

    gamePrompt = data.challenge?.gamePrompt?.prompt

    console.log({ challenge: data.challenge })
    choodleOwner = data.challenge.challenger._id === currentChoodler._id

    // Store in localstorage on Draw:
    //  - all details we need to draw it here, including the image

    // If the challenge is in localstorage, render it immediately.
    // Wait for it to load.
    //   If the currentChoodler doesn't own it, redirect to guess page.

    if (!choodleOwner) {
      goto(`/guess/${data.challenge._id}`)
      return
    }

    console.log({ choodleOwner })

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
  <div class="topBar" slot="topBar">
    <TopBar>
      <div slot="topBarContent">
        {@html toHTML(data.copy.guess_pageAuthorTopContent)}
      </div>
    </TopBar>
  </div>

  <ChoodleContainer --choodle-max-height-offset="27rem">
    <img src={bestImageUrl(data.challenge.choodle)} alt="" />
  </ChoodleContainer>

  <h3><strong>{data.challenge?.gamePrompt?.prompt?.toUpperCase()}</strong></h3>
  <div class="cta">
    <Button colour="yellow" on:click={handleShare}
      >{copiedToClipboard
        ? data.copy.guess_copiedToClipboard
        : data.copy.guess_shareButtonText}</Button
    >
  </div>
</LayoutContainer>

<style>
  .topBar {
    width: 100%;
  }
  .cta {
    margin-top: 3rem;
  }
</style>
