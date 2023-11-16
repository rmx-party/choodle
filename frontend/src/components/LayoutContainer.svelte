<script>
  import { navigating } from '$app/stores'
  import { loading } from '$lib/store'
  import { fade } from 'svelte/transition'
</script>

{#if !$navigating && !$loading}
  <div id="layoutContainer" transition:fade={{ duration: 300 }} {...$$restProps}>
    <slot name="topBar" />
    <div id="flexLayout">
      <slot />
    </div>
  </div>
{/if}

<style>
  #layoutContainer {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    text-align: center;
    padding: 0;
    margin: 0 auto;

    width: 100%;
    height: clamp(500px, calc(100svh - 44px), 900px);
  }

  #flexLayout {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    text-align: center;
    margin: 0;

    padding: 0 1rem;
    width: 100%;
    height: 100%;
    max-width: 720px;

    justify-content: var(--layout-justify, flex-start);
  }

  .no-pan {
    touch-action: pan-x pan-y;
    touch-action: none;
  }
</style>
