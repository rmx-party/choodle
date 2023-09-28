<script lang="ts">
    export let focusOnMount: boolean;
    export let submitEnabled: boolean;
    export let format: string;
    export let currentGuess;

    const singleSpacedFormat = format.replace(/\s+/g,' ').trim()

    currentGuess.subscribe((newCurrentGuess)=>{
        const value = (newCurrentGuess.length === singleSpacedFormat.length)
          ? true
          : false
        submitEnabled.set(value)
    })

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
        next?.focus()
    }

    const onInput = (event: Event) => {
        currentGuess.set(replaceCharAt($currentGuess, Number(event.target.dataset.index), event.target.value))
        focusNext(event.target)
    }

    const focusPrevious = (target: HTMLElement) => {
        let isLast = Number(target.dataset.index) === singleSpacedFormat.length - 1
        let isEmpty = target.value === ' ' || target.value === ''
        let previous = target.previousElementSibling
        if (!previous) {
            target.select()
            return
        }
        if (isLast && !isEmpty) {
            target.select()
            return
        }
        if (previous.tagName.toLowerCase() !== "input") {
            previous = target.previousElementSibling.previousElementSibling
        }
        previous.focus()
    }

    const onKeyDown = (event: KeyboardEvent) => {
        // FIXME: ignore spacebar
        if (event.key === "Backspace") {
            event.preventDefault()
            currentGuess.set(replaceCharAt($currentGuess, Number(event.target.dataset.index), ' '))
            if ($currentGuess[event.target.dataset.index - 1] === ' ') {
                currentGuess.set(replaceCharAt($currentGuess, Number(event.target.dataset.index), ' '))
            }
            focusPrevious(event.target)
        }
    }
</script>

<div id="guessInput">
  {#each singleSpacedFormat as formatCharacter, i}
    {#if formatCharacter === " "}
      <span class="blank" data-index={i}/>
    {:else}
      {#if i == 0}
        <input name={`guessInput[${i}]`} data-index={i} type="text" maxlength="1" value={$currentGuess[i] || ''}
          on:input={onInput} on:keydown={onKeyDown} on:focus={(event) => {event.target.select()}}
          autofocus={focusOnMount}/>
      {:else}
        <input name={`guessInput[${i}]`} data-index={i} type="text" maxlength="1" value={$currentGuess[i] || ''}
          on:input={onInput} on:keydown={onKeyDown} on:focus={(event) => {event.target.select()}}/>
      {/if}
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


