<script lang="ts">
  import lifeSaverIcon from '$lib/assets/mdi_lifebuoy.svg';
  import redX from '$lib/assets/red_x.svg';

  export type hint = {
    used: boolean;
    text: string;
  };
  export let hints: hint[] = [];
  export let hintCta = '';
  export let activeHint = -1;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  export let afterHint = (hint: hint) => {};

  const activateHint = (index) => () => {
    activeHint = index;
    hints[index].used = true;

    afterHint(hints[index]);
  };
</script>

<div class="hintsContainer">
  {#if hints?.length > 0}
    <div class="hintButtons">
      {#each hints as hint, index}
        <button
          on:click={activateHint(index)}
          class={`hintButton ${index == activeHint ? 'active' : ''} ${hint.used ? 'used' : ''}`}
        >
          {#if hint.used}
            <img src={lifeSaverIcon} alt="reveal a hint" />
            <img src={redX} alt="hint used" style="position: absolute;" />
          {:else}
            <img src={lifeSaverIcon} alt="reveal a hint" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <div class="hintCopy">
    {#if activeHint >= 0}
      <p>{hints[activeHint].text}</p>
    {:else}
      <p>{hintCta}</p>
    {/if}
  </div>
</div>

<style>
  .hintsContainer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0;
    text-align: center;
  }

  .hintButtons {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
    justify-content: center;
  }

  .hintButton {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.125rem;
    background: var(--colors-greyscale-200, #d3d3d3);
    width: 2rem;
    height: 2rem;
    border: none;
  }

  .hintButton.active {
    background: var(--choodle-yellow);
  }

  .hintCopy {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 3.375rem;
    padding: 0.5rem;
    align-items: center;
    gap: 0.5rem;
    background: var(--choodle-yellow);
  }
</style>
