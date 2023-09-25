<script lang="ts">
    export let format
    const singleSpacedFormat = format.replace(/\s+/g,' ').trim()
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
            next = target.nextElementSibling.nextElementSibling
        }
        next.focus()
        console.log(currentGuess)
    }

    const onInput = (event: Event) => {
        focusNext(event.target)
        currentGuess.set(replaceCharAt($currentGuess, Number(event.target.dataset.index), event.target.value))
        console.log(currentGuess)
    }
</script>

<div id="guessInput">
    {#each singleSpacedFormat as formatCharacter, i}
        {#if formatCharacter === " "}
            <span class="blank"/>
        {:else}
            <input name={`guessInput[${i}]`} data-index={i} type="text" maxlength="1" on:input={onInput}/>
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