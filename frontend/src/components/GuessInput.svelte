<script lang="ts">
  export let format: string[];
  export let display: string[];
  export let cursorLocation: number;
</script>

<div class="input" {...$$restProps}>
  {#each format as formatCharacter, i}
    <div class="{formatCharacter === ' ' ? 'space' : 'character'} {i === cursorLocation ? 'cursor' : ''}">
      {display[i] || ' '}
    </div>
  {/each}
</div>

<style>
  :root {
    --bgcolor: white;
  }
  .input {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0.5rem auto;
  }

  .character {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bgcolor, white);
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
