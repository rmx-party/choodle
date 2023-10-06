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
  .input {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0.5rem auto;
    line-height: 100%;
    gap: 0.125rem;

    color: var(--text-text-primary, #141518);
    text-align: center;

    /* mobile/h3-bold */
    font-family: DejaVu Sans Bold;
    font-size: 1.125rem;
    font-style: normal;
    font-weight: 700;
  }

  .character, .space {
    width: 2rem;
    aspect-ratio: 1/1;
  }
  .character {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    border: 2px solid black;
    padding: 0.1rem;

    border-radius: 0.125rem;
    border: 1px solid var(--colors-greyscale-600, #7C7C77);
    background: var(--bgcolor, white);
  }

  .cursor {
    background: var(--choodle-yellow, lightgrey);
  }
</style>
