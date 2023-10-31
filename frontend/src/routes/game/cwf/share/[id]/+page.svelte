<script lang="ts">
  import {urlFor} from '$lib/PersistedImagesUtils.js';
  import TopBar from "../../../../../components/TopBar.svelte";
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {page} from "$app/stores";
  import MetaData from "../../../../../components/MetaData.svelte";
  import {onMount} from "svelte";
  import {getDeviceId, getEmail, getUsername, locateCreator} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import fp from "lodash/fp";
  import {toHTML} from "@portabletext/to-html";
  import {choodleYellow, pageBackgroundDefault} from '$lib/Configuration';
  import LayoutContainer from '../../../../../components/LayoutContainer.svelte';
  import ChoodleContainer from '../../../../../components/ChoodleContainer.svelte';
  import {loading, loadingMessage} from "$lib/store";

  loadingMessage.set('loading')

  export let data;

  let choodleOwner = false;
  let copiedToClipboard = false;

  let deviceId
  let email
  let username = ''
  let currentChoodler

  let gamePrompt

  const canShare = (shareable?): boolean => {
    if (!browser) return false;
    if (!navigator.share) return false;

    return navigator.canShare(shareable)
  }

  const share = async (event: Event) => {
    event.preventDefault()
    if (!browser) return;

    let gamePromptTiles = gamePrompt.prompt ? fp.map((char) => (char === ' ') ? '⬜' : '🟨', gamePrompt.prompt.split('')).join('') : ''

    const url = `${window.location.origin}/game/cwf/guess/${data.challenge._id}`
    const shareCopy = data.copy.share_messageText || ''
    const text = [shareCopy, gamePromptTiles, url].join(`\n`)
    const shareable = {text};

    console.log(`sharing:`, shareable)

    if (canShare(shareable)) {
      console.log('Thanks for sharing!');
      navigator.share(shareable);
    } else {
      console.log(`copied "${text}" to clipboard`)
      await navigator.clipboard.writeText(text);
      copiedToClipboard = true;
    }
  }

  onMount(async () => {
    deviceId = await getDeviceId()

    email = await getEmail()
    username = (await getUsername()) || ''
    currentChoodler = await locateCreator({email, deviceId, username})

    gamePrompt = data.challenge.gamePromptRef.prompt

    console.log({challenge: data.challenge})
    choodleOwner = (data.challenge.challenger._id === currentChoodler._id) // TODO: this is based on device+choodle, should be by creator account

    console.log({choodleOwner})

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

<MetaData url={$page.url}
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

  <ChoodleContainer --choodle-max-height-offset='27rem'>
    <img src={bestImageUrl(data.challenge.choodle)} alt=''/>
  </ChoodleContainer>

  <h3><strong>{data.challenge.gamePromptRef.prompt.toUpperCase()}</strong></h3>
  <div>
    <Button colour="yellow"
            on:click={share}>{copiedToClipboard ? data.copy.guess_copiedToClipboard : data.copy.guess_shareButtonText}</Button>
  </div>
  <div>
    <Button on:click={() => {goto('/game/cwf')}}>{data.copy.guess_doneButtonText}</Button>
  </div>
</LayoutContainer>

<style>
  .topBar {
    width: 100%;
  }
</style>
