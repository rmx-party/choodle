<script lang="ts">
  import lifeSaverIcon from '$lib/assets/mdi_lifebuoy.svg';
  import redX from '$lib/assets/red_x.svg';

  export let hints = [];
  export let hintCta = '';
  export let activeHint = -1;


  const activateHint = (index) => () => {
    activeHint = index;
    // TODO: mark hint as used
  }
</script>


{#if hints?.length > 0}
  <p>Hints</p>
  <div class="hintButtons">
    {#each hints as hint, index}
      <button on:click={activateHint(index)} class={`hintButton ${index == activeHint ? 'active' : '' }`} disabled={hint.used}>
        {#if hint.used}
          <img src={lifeSaverIcon} alt="reveal a hint" />
          <img src={redX} alt="hint used" style="position: absolute;"/>
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

<style>
  .hintButtons {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.5rem;
  }

  .hintButton {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 0.125rem;
    background: var(--colors-greyscale-200, #D3D3D3);
    width: 2.5rem;
    height: 2.5rem;
    border: none;
  }
  .hintButton.active {
    background: var(--choodle-yellow);
  }

  .hintCopy {
    display: flex;
    width: 100%;
    height: 4.375rem;
    padding: 1rem;
    align-items: center;
    gap: 0.5rem;
    background: var(--choodle-yellow);
  }
</style>
