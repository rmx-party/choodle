<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils.js';
  import CharacterInput from "./CharacterInput.svelte";
  import {writable} from "svelte/store";

  export let data;
  const currentGuess = writable('')

  const {gamePrompt} = data.choodle;
  let guess = '';
  let winner = false;
  let guessesRemaining = 3;

  const check = (event: Event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    let guess = '';
    for (const value of formData.values()) {
      guess = guess.concat(value.toString())
    }

    guessesRemaining--;
    console.log(`checking answer, ${guessesRemaining} guesses left`)

    if (guess.toLowerCase() !== gamePrompt.toLowerCase()) {
      console.log(`wrong`)
      // FIXME: clear out the form inputs
      return;
    }

    winner = true;
    console.log(`right answer, you won the thing`)
  }
</script>

<div class="container">
  <div class="choodle-container">
    <img class="choodle" src={urlFor(data.choodle.upScaledImage)}
      width='390' height='520' alt=''/>
  </div>
  {#if winner}
    <p>nice job guessing <code>{gamePrompt}</code>, you win this:</p>
    <div class='award'>🏆</div>
  {:else}
    {#if guessesRemaining === 0}
      <p>you didn't recognize <code>{gamePrompt}</code>?</p>
      <div class='award'>😞</div>
    {:else}
      <p>guess what this is, {guessesRemaining} chances left</p>
      <form id="guessForm" on:submit={check}>
        <CharacterInput format={gamePrompt} {currentGuess} />
        <button>guess</button>
      </form>
    {/if}
  {/if}
</div>

<style>
    :root {
        text-align: center;
    }

    .container {
        /* gap: 2rem; */
        padding: 1rem 1rem;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: stretch;
        align-items: stretch;
        justify-content: space-evenly;
        height: 100dvh;
        width: 100%;
        padding: 1.5rem;
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
    .award {
      font-size: 5rem;
      width: 100%;
    }
</style>
