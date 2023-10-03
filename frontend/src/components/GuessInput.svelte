<script lang="ts">
  export let format;
  export let display;
  export let cursorLocation;
</script>

<div class="input">
  {#each format as formatCharacter, i}
    <div class="{formatCharacter === ' ' ? 'space' : 'character'} {i === cursorLocation ? 'cursor' : ''}">
      {display[i] || ' '}
    </div>
  {/each}
</div>

<style>
  .input {
    display: flex;
    flex-direction: row;
  }

  .character {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 0.25rem;
    border: 2px solid black;
    padding: 0.1rem;
    margin: 0.1rem;
    width: 2rem;
    aspect-ratio: 1/1;
  }

  .cursor {
    background: lightgrey;
  }

  .space {
    margin: 0.1rem;
    width: 2rem;
    aspect-ratio: 1/1;
  }
</style>
