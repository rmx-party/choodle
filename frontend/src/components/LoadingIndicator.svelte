<script lang="ts">
  import { loading, loadingOverride, loadingReasons, showLoadingIndicator } from '$lib/store'
  import { fade } from 'svelte/transition'
  import { navigating, page } from '$app/stores'
  import { urlFor } from '$lib/PersistedImagesUtils'
  import PixelImage from './PixelImage.svelte'
  import { browser } from '$app/environment'
  import interstitialImage from '$lib/assets/interstitial-smiley-l.png'

  const logLoadingStateDebug = () => {
    console.log(`loading state`, {
      loading: $loading,
      navigating: $navigating,
      showLoadingIndicator: $showLoadingIndicator,
      loadingReasons: $loadingReasons,
    })
  }
  $: {
    browser && [$loading, $navigating, $loadingReasons, $loadingOverride, $showLoadingIndicator] &&
      logLoadingStateDebug()
  }
</script>

{#if $showLoadingIndicator || $loadingOverride}
  <div
    class="LoadingIndicator loading-backdrop no-pan"
    in:fade={{ delay: 100, duration: 300 }}
    out:fade={{ duration: 300 }}
  >
    <PixelImage
      class="logo"
      src={urlFor($page.data.copy.logo).url()}
      alt=""
      height={32}
      width={100}
    />
    <div class="loading" transition:fade={{ duration: 300 }}>
      <div class="group">
        <PixelImage
          class="loading-image"
          height={134}
          width={161}
          src={interstitialImage}
          alt="A doodle of the painter Bob Ross, slightly smiling"
        />
      </div>
    </div>
  </div>
{:else}
  <span class="not-loading"> not loading </span>
{/if}

<style>
  :root {
    text-align: center;
  }

  .loading-backdrop {
    z-index: 9999;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;

    background: var(--choodle-yellow);
    overflow: clip;
  }

  /* loading element style */
  .loading {
    width: 100svw;
    height: 90svh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .group {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  :global(.logo) {
    width: 100px;
    height: 32px;
    flex-shrink: 1;
    margin: 0.42rem 1rem;
  }

  .not-loading {
    display: none;
  }

  .no-pan {
    touch-action: pan-x pan-y;
    touch-action: none;
  }
</style>
