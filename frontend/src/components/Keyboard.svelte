<script lang="ts">
  import {onMount} from "svelte";
  import {browser} from "$app/environment";

  const keyRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'BACKSPACE'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER']
  ]

  export let onKeyPress;
  const {disabled} = $$restProps
  console.log("disabled", $$restProps.disabled)

  const handleKeyInput = (input) => {
    onKeyPress(input)
  }

  const handleKeyPress = (event) => {
    event.preventDefault()
    let key = event.target.dataset["key"];
    handleKeyInput(key)
  }

  onMount(() => {
    if (!browser) return;

    let keyUpListener = (event) => {
      if (disabled) return;
      const validKeys = keyRows.flatMap(key => key).flatMap(key => key.toUpperCase())
      if (validKeys.includes(event.key.toUpperCase())) {
        event.preventDefault()
        handleKeyInput(event.key.toUpperCase())
      }
    };
    window.addEventListener("keyup", keyUpListener)

    document.getElementById("keyboard")?.focus()

    return () => {
      if (!browser) return;
      window.removeEventListener("keyup", keyUpListener)
    }
  })

  const displayKey = (key: string) => {
    if (key === 'BACKSPACE') return '⌫'
    if (key === 'ENTER') return 'ENTER'
    return key
  }
</script>

<div class="keyboard">
  {#each keyRows as row}
    <div class="keyboardRow">
      {#each row as key}
        <button class={`keyboardKey ${key.toLowerCase()}`} on:click={handleKeyPress}
                data-key="{key}" {disabled}>{displayKey(key)}</button>
      {/each}
    </div>
  {/each}
</div>

<style>
  .keyboard, .keyboardRow, .keyboardKey {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.3rem;
    text-align: center;
  }

  .keyboard {
    flex-direction: column;
    padding: 0.5rem;
    max-width: 100%;
  }

  .keyboardRow {
    flex-direction: row;
  }

  .keyboardKey {
    vertical-align: center;
    display: flex;
    padding: 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    width: 1.8rem;
    height: 2.5rem;
    border: none;
    border-radius: 0.0625rem;
    background: hsla(0, 0%, 83%, 1);
    color: var(--choodle-black);
    font-size: 1.3rem;
  }

  .backspace {
    width: 2.5rem;
    font-size: 1.5rem;
  }

  .enter {
    width: 5rem;
    font-size: 1.1rem;
  }
</style>
