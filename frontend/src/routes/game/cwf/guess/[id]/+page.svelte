<script lang="ts">
  import {urlFor} from '$lib/PersistedImagesUtils.js';
  import {writable} from "svelte/store";
  import GuessingHUD from "../../../../../components/GuessingHUD.svelte";
  import TopBar from "../../../../../components/TopBar.svelte";
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {page} from "$app/stores";
  import MetaData from "../../../../../components/MetaData.svelte";
  import {onMount} from "svelte";
  import {getDeviceId} from "$lib/CreatorUtils";
  import {browser} from "$app/environment";
  import fp from "lodash/fp";
  import GuessingInterface from "../../GuessingInterface.svelte";
  import GuessInput from "../../../../../components/GuessInput.svelte";
  import {toHTML} from "@portabletext/to-html";
  import {choodleYellow, pageBackgroundDefault} from '$lib/Configuration';
  import LayoutContainer from '../../../../../components/LayoutContainer.svelte';
  import ChoodleContainer from '../../../../../components/ChoodleContainer.svelte';
  import {dialogState, loading} from '$lib/store';
  import Keyboard from '../../../../../components/Keyboard.svelte';
  import Dialog from "../../../../../components/Dialog.svelte";

  loading.set(true)

  export let data;
  const currentGuess = writable([])
  const cursorLocation = writable(0)

  // TODO: CMS manageed
  let guessesRemaining = 3;
  let guessesLimit = 3;

  let choodleOwner = false;
  let copiedToClipboard = false;
  let success = false;

  const check = () => {
    if ($currentGuess.length < data.choodle.gamePrompt.length) return;

    guessesRemaining--;
    console.log(`checking answer, ${guessesRemaining} guesses left`)

    if ($currentGuess.join('').toUpperCase() !== data.choodle.gamePrompt.toUpperCase()) {
      console.log(`wrong`)
      currentGuess.set([])
      cursorLocation.set(0)
      return;
    }

    console.log(`right answer, you won the thing`)
    success = true

    goto(`/game/cwf/success/${data.choodle._id}`)
  }

  const canShare = (shareable?): boolean => {
    if (!browser) return false;
    if (!navigator.share) return false;

    return navigator.canShare(shareable)
  }

  const share = async (event: Event) => {
    event.preventDefault()
    if (!browser) return;

    let gamePromptTiles = data.choodle.gamePrompt ? fp.map((char) => (char === ' ') ? '⬜' : '🟨', data.choodle.gamePrompt.split('')).join('') : ''

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

  const showHint = () => {
    dialogState.update(dialogs => {
      return {...dialogs, ["hint"]: true}
    })
  }

  onMount(async () => {
    choodleOwner = (data.choodle.creatorId === await getDeviceId())
    loading.set(false)
  })
</script>

<MetaData url={$page.url}
          title="Choodle with Friends"
          imageUrl={urlFor(data.choodle.upScaledImage).url()}
          width="430"
          height="932"
          themeColor={choodleYellow}
          bgColor={pageBackgroundDefault}
/>

<LayoutContainer class="no-pan">
  <div class="topBar" slot="topBar">
    {#if choodleOwner}
      <TopBar>
        <div slot="topBarContent">
          {@html toHTML(data.copy.guess_pageAuthorTopContent)}
        </div>
      </TopBar>
    {:else}
      <GuessingHUD {guessesRemaining} {guessesLimit}>
        <div slot="content">
          {@html toHTML(data.copy.guess_pageTopContent)}
        </div>
      </GuessingHUD>
    {/if}
  </div>

  <ChoodleContainer>
    <img src={urlFor(data.choodle.upScaledImage).url()} width='390' height='520' alt=''/>
  </ChoodleContainer>

  {#if choodleOwner}
    <h3><strong>{data.choodle.gamePrompt.toUpperCase()}</strong></h3>
    <div>
      <Button colour="yellow"
              on:click={share}>{copiedToClipboard ? data.copy.guess_copiedToClipboard : data.copy.guess_shareButtonText}</Button>
    </div>
    <div>
      <Button on:click={() => {goto('/game/cwf')}}>Dashboard</Button>
    </div>
  {:else}
    {#if success}
      <p class="">{data.copy.guess_successMessageText}</p>
      <GuessInput
        format={data.choodle.gamePrompt.split('')}
        display={data.choodle.gamePrompt.split('').map(str => str.toUpperCase())}
        cursorLocation={-1} --bgcolor="var(--choodle-yellow)"/>
      <p><!-- layout placeholder --> </p>
      <Keyboard onKeyPress={() => {}}/>
    {:else}
      {#if guessesRemaining < 1}
        <p class="failure">{data.copy.guess_failureMessageText ? data.copy.guess_failureMessageText : ' '}</p>
        <GuessInput
          format={data.choodle.gamePrompt.split('')}
          display={data.choodle.gamePrompt.split('').map(str => str.toUpperCase())}
          cursorLocation={-1} --bgcolor="var(--choodle-yellow)"/>

        <p><!-- layout placeholder --> </p>
        <div style={`height: 10rem; /* corresponds to game keyboard height */`}>
          <Button colour="yellow" on:click={() => {goto(`/game/cwf/pick`)}}>
            {data.copy.guess_failureNewGameButtonText}
          </Button>
        </div>
      {:else}
        {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
          <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
        {:else}
          <p><!-- layout placeholder --> </p>
        {/if}
        <GuessingInterface format={data.choodle.gamePrompt.split('')} inputDisplay={currentGuess}
                           cursorLocation={cursorLocation} onEnter={check}>
          <div slot="between">
            <a on:click={showHint}>Need a hint?</a>
          </div>
        </GuessingInterface>
      {/if}
    {/if}
  {/if}
  <Dialog id={'hint'}>
    <h1 slot="header">Hint</h1>
    <br/>
    <p>{data.choodle.gameHint}</p>
    <br/>
  </Dialog>
</LayoutContainer>

<style>
  .topBar {
    width: 100%;
  }

  p {
    margin: 0.5rem;
  }

  .failure {
    color: red;
  }
</style>
