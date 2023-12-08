<script lang="ts">
  import { browser } from '$app/environment'
  import Button from './Button.svelte'

  export let options = []
  $: initialOptions = [...options]
  $: unUsedOptions = [...initialOptions]
  export let selectedOption = options[0]

  export let callback: (previous, current) => void = () => {}

  function handleClick(event: MouseEvent): void {
    if (!browser) return
    event.preventDefault()

    const skippedOption = selectedOption

    // add GA event for skipped prompt
    window?.gtag?.('event', 'skip_prompt', {
      event_category: 'engagement',
      event_label: `${skippedOption?.prompt}`,
    })

    rotatePrompts()

    // TODO: fire optional callback with previous and new values
    callback(skippedOption, selectedOption)
  }

  const rotatePrompts = () => {
    console.log(unUsedOptions, initialOptions)
    if (unUsedOptions.length >= 1) {
      selectedOption = unUsedOptions.pop()
      return
    }

    console.log(`no more prompts, resetting`)
    unUsedOptions = [...initialOptions]
    selectedOption = unUsedOptions.pop()
  }
</script>

<div class="shuffle-select">
  <output for="shuffle">
    <slot name="output">
      {selectedOption?.prompt}
    </slot>
  </output>
  <Button id="shuffle" colour="black" on:click={handleClick}>
    <slot name="button" />
  </Button>
</div>

<style>
  .shuffle-select {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    width: 20rem;
    height: 3.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.0625rem;

    border-radius: 0.75rem;
    background: var(--colors-brand-white, #fff);
    backdrop-filter: blur(75px);

    overflow: hidden;
    color: var(--colors-brand-choodle-black, #141518);
    text-overflow: ellipsis;

    /* mobile/body-reg */
    font-family: DejaVu Sans;
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    line-height: 120%; /* 1.2rem */

    margin: 1rem 0;
  }
  output {
    flex-grow: 1;
    display: flex;
    padding: 1rem 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    text-align: center;

    text-transform: uppercase;
  }

  .shuffle-select :global(.btn.black),
  .shuffle-select :global(.btn.black:disabled),
  .shuffle-select :global(.btn.black:hover),
  .shuffle-select :global(.btn.black:focus),
  .shuffle-select :global(.btn.black:active) {
    flex-grow: 0;
    flex-shrink: 0;
    width: 3.5rem !important;
    height: 3.5rem !important;
    padding: 0;
    border: none;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 120%; /* 1.2rem */
    text-align: center;
    text-transform: uppercase;

    border-radius: 0rem 0.75rem 0.75rem 0rem !important;
    background: var(--choodle-black, #141518);
    box-shadow: none;
  }
</style>
