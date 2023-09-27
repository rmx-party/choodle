<script lang="ts">
    export let format
    const singleSpacedFormat = format.replace(/\s+/g, ' ').trim()
    export let currentGuess;

    const replaceCharAt = (originalString: string, index: number, replacement: string) => {
        let left = originalString.slice(0, index);
        let right = originalString.slice(index + 1);
        return `${left}${replacement}${right}`;
    }

    const focusNext = (target: HTMLElement) => {
        let next = target.nextElementSibling
        if (!next) {
            return
        }
        if (next.tagName.toLowerCase() !== "input") {
            currentGuess.set(replaceCharAt($currentGuess, Number(next.dataset.index), ' '))
            next = target.nextElementSibling.nextElementSibling
        }
        next.focus()
    }

    const onInput = (event: Event) => {
        currentGuess.set(replaceCharAt($currentGuess, Number(event.target.dataset.index), event.target.value))
        focusNext(event.target)
    }

    const focusPrevious = (target: HTMLElement) => {
        let previous = target.previousElementSibling
        if (!previous) {
            return
        }
        if (previous.tagName.toLowerCase() !== "input") {
            currentGuess.set(replaceCharAt($currentGuess, Number(previous.dataset.index), ' '))
            previous = target.previousElementSibling.previousElementSibling
        }
        previous.focus()
        previous.value = ''
    }

    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key === "Backspace") {
            currentGuess.set(replaceCharAt($currentGuess, Number(event.target.dataset.index), ''))
            focusPrevious(event.target)
        }
    }
</script>

<div id="guessInput">
    {#each singleSpacedFormat as formatCharacter, i}
        {#if formatCharacter === " "}
            <span class="blank" data-index={i}/>
        {:else}
            <input name={`guessInput[${i}]`} data-index={i} type="text" maxlength="1" value={$currentGuess[i] || ''}
                   on:input={onInput} on:keyup={onKeyUp}/>
        {/if}
    {/each}
</div>

<style>
    input {
        width: 2rem;
        height: 2rem;
        text-align: center;
        border-radius: 0.25rem;
        margin: 0.1rem;
    }

    .blank {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        background: none;
        content: " ";
    }
</style>