<script lang="ts">
  import {urlFor} from '$lib/PersistedImagesUtils.js';
  import CharacterInput from "./CharacterInput.svelte";
  import {writable} from "svelte/store";
  import GuessingHUD from "../../../../../components/GuessingHUD.svelte";
  import Button from "../../../../../components/Button.svelte";
  import {goto} from "$app/navigation";
  import {page} from "$app/stores";
  import MetaData from "../../../../../components/MetaData.svelte";

  export let data;
  const currentGuess = writable('')
  const submitEnabled = writable(false)

  // TODO: CMS manageed
  let guessesRemaining = 3;
  let guessesLimit = 3;

  const check = (event: Event) => {
    event.preventDefault();

    guessesRemaining--;
    console.log(`checking answer, ${guessesRemaining} guesses left`)

    if ($currentGuess.toLowerCase() !== data.choodle.gamePrompt.toLowerCase()) {
      console.log(`wrong`)
      currentGuess.set('')
      return;
    }

    console.log(`right answer, you won the thing`)
    goto('/game/cwf/success')
  }
</script>

<MetaData url={$page.url.toString()}
  imageUrl={urlFor(data.choodle.upScaledImage).url()}
  width="430"
  height="932"
/>

<div class="flex-container">
  <GuessingHUD content={data.copy.guess_pageTopContent} {guessesRemaining} {guessesLimit}/>
  <div class="choodle-container">
    <img class="choodle" src={urlFor(data.choodle.upScaledImage).url()}
      width='390' height='520' alt=''/>
  </div>
  {#if guessesRemaining < 1}
    {#if data.copy.guess_failureMessageText}
      <p class="failure">{data.copy.guess_failureMessageText}</p>
    {/if}
    {#if data.copy.guess_failureRightAnswerText}
      <p>{data.copy.guess_failureRightAnswerText} <code>{data.choodle.gamePrompt}</code></p>
    {/if}
    <Button colour="yellow" variant="primary" on:click={() => {goto(`/game/cwf/pick`)}}>
      {data.copy.guess_failureNewGameButtonText}
    </Button>
  {:else}
    <form id="guessForm" on:submit={check}>
      {#if guessesRemaining < guessesLimit && data.copy.guess_incorrectFeedbackText}
        <p class="failure">{data.copy.guess_incorrectFeedbackText}</p>
      {/if}
      <CharacterInput {submitEnabled} format={data.choodle.gamePrompt} {currentGuess} focusOnMount/>
      <Button colour="yellow" variant="primary">{data.copy.guess_doneButtonText}</Button>
    </form>
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
    justify-content: space-between;
    align-items: center;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */
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
    max-height: 50%;
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
