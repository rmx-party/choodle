<script lang="ts">
  import {urlFor} from '$lib/PersistedImagesUtils.js';
  import {writable} from "svelte/store";
  import GuessingHUD from "../../../../../components/GuessingHUD.svelte";
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {page} from "$app/stores";
  import MetaData from "../../../../../components/MetaData.svelte";
  import {onMount} from "svelte";
  import {getDeviceId} from "$lib/DeviceIdUtils";
  import {browser} from "$app/environment";
  import fp from "lodash/fp";
  import GuessingInterface from "../../GuessingInterface.svelte";

  export let data;
  const currentGuess = writable([])
  const cursorLocation = writable(0)


  // TODO: CMS manageed
  let guessesRemaining = 3;
  let guessesLimit = 3;

  let choodleOwner = false;
  let copiedToClipboard = false;

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

    const url = `${window.location.origin}/game/cwf/guess/${data.choodle._id}`
    const shareCopy = `Can you guess what this is?` // TODO: use cms copy
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
    choodleOwner = data.choodle.creatorId === await getDeviceId()
  })
</script>

<MetaData url={$page.url.toString()}
          imageUrl={urlFor(data.choodle.upScaledImage).url()}
          width="430"
          height="932"
/>

<div class="flex-container">
  {#if choodleOwner}
    <GuessingHUD content={data.copy.guess_pageAuthorTopContent}/>
  {:else}
    <GuessingHUD content={data.copy.guess_pageTopContent} {guessesRemaining} {guessesLimit}/>
  {/if}
  <div class="choodle-container">
    <img class="choodle" src={urlFor(data.choodle.upScaledImage).url()}
         width='390' height='520' alt=''/>
  </div>
  {#if choodleOwner}
    <h3><strong>{data.choodle.gamePrompt.toUpperCase()}</strong></h3>
    <div>
      <Button colour="yellow"
              on:click={share}>{copiedToClipboard ? data.copy.guess_copiedToClipboard : data.copy.guess_shareButtonText}</Button>
    </div>
  {:else}
    {#if guessesRemaining < 1}
      {#if data.copy.guess_failureMessageText}
        <p class="failure">{data.copy.guess_failureMessageText}</p>
      {/if}
      {#if data.copy.guess_failureRightAnswerText}
        <p>{data.copy.guess_failureRightAnswerText}</p>
        <p><strong>{data.choodle.gamePrompt.toUpperCase()}</strong></p>
      {/if}
      <div>
        <Button colour="yellow" on:click={() => {goto(`/game/cwf/pick`)}}>
          {data.copy.guess_failureNewGameButtonText}
        </Button>
      </div>
    {:else}
      {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
        <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
      {/if}
      <GuessingInterface format={data.choodle.gamePrompt.split('')} inputDisplay={currentGuess}
                         cursorLocation={cursorLocation} onEnter={check}/>
    {/if}
  {/if}
</div>

<style>
  :global(:root) {
    --page-background-color: rgba(20, 21, 24, 0.03);
  }

  .flex-container {
    background-color: rgba(20, 21, 24, 0.03);

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    height: 100svh;
    height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */

    padding-bottom: 1rem;
  }

  :root {
    text-align: center;
  }

  .choodle-container {
    flex-grow: 1;
    margin: 2rem auto;
    display: flex;
    align-items: center;
    padding: 0;
    flex-grow: 1;
    flex-shrink: 1;
    max-height: 50dvh;
    max-width: 100%;
    aspect-ratio: 3/4;
  }

  img.choodle {
    flex-shrink: 1;
    flex-grow: 1;
    max-height: 100%;
    max-width: 100%;
    image-rendering: pixelated;

    border-radius: 0.22175rem;
    box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
  }

  .failure {
    color: red;
  }
</style>
