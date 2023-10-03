<script lang="ts">
  import {onMount} from "svelte";
  import {browser} from "$app/environment";

  const keyRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ]

  export let onKeyPress;

  const handleKeyInput = (input) => {
    console.log("pressed: ", input)
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
</script>

<div class="keyboard">
  {#each keyRows as row}
    <div class="keyboardRow">
      {#each row as key}
        <div class="keyboardKey" on:click={handleKeyPress} data-key="{key}">{key}</div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .keyboard {
    display: flex;
    flex-direction: column;
  }

  .keyboardRow {
    display: flex;
    flex-direction: row;
  }

  .keyboardKey {
    text-align: center;
    background: white;
    border-radius: 0.25rem;
    width: 2rem;
    padding: 0.5rem;
    margin: 0.1rem;
  }
</style>
