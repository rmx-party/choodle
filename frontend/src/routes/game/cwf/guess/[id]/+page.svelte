<script lang="ts">
    import {urlFor} from '$lib/PersistedImagesUtils.js';
    import CharacterInput from "./CharacterInput.svelte";
    import {writable} from "svelte/store";
    import GuessingHUD from "../../../../../components/GuessingHUD.svelte";
    import Button from "../../../../../components/Button.svelte";
    import {goto} from "$app/navigation";

    export let data;
    const currentGuess = writable('')

    const {gamePrompt} = data.choodle;
    let winner = false;
    let guessesRemaining = 3;
    let guessesLimit = 3;

    const check = (event: Event) => {
        event.preventDefault();

        guessesRemaining--;
        console.log(`checking answer, ${guessesRemaining} guesses left`)

        if ($currentGuess.toLowerCase() !== gamePrompt.toLowerCase()) {
            console.log(`wrong`)
            currentGuess.set('')
            return;
        }

        winner = true;
        console.log(`right answer, you won the thing`)
        goto('/game/cwf/success')
    }
</script>

<div class="flex-container">
    <GuessingHUD content="guess" {guessesRemaining} {guessesLimit}/>
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
                <CharacterInput format={gamePrompt} {currentGuess}/>
                <Button colour="yellow" variant="primary">Submit</Button>
            </form>
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

    .award {
        font-size: 5rem;
        width: 100%;
    }
</style>
