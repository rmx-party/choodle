<script lang="ts">
  import { loading, loadingOverride } from '$lib/store'
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { toHTML } from '@portabletext/to-html'
  import { navigating, page } from '$app/stores'
  import { urlFor } from '$lib/PersistedImagesUtils'
  import PixelImage from './PixelImage.svelte'

  export let rotatingMessages: unknown[] = []

  // eslint-disable-next-line no-undef
  let interval: string | number | NodeJS.Timeout | undefined
  let messageIndex = -1

  loading.subscribe((value) => {
    console.info(`loading state change: `, value, { navigating: $navigating })
  })

  const messageRotationTimeMs = 6000
  onMount(() => {
    if (rotatingMessages?.length > 0) {
      messageIndex = 0
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % rotatingMessages.length
      }, messageRotationTimeMs)
    }

    return () => clearInterval(interval)
  })
</script>

{#if $navigating || $loading || $loadingOverride}
  <div
    class="LoadingIndicator loading-backdrop no-pan"
    in:fade={{ delay: 60, duration: 300 }}
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
          height={263}
          width={174}
          src="/choodle-bob-p2.png"
          alt="A doodle of the painter Bob Ross, slightly smiling"
        />
        <div class="messageContainer">
          {#if messageIndex >= 0 && rotatingMessages?.length > 0}
            {#key messageIndex}
              <div class="message" transition:fade={{ duration: 300 }}>
                {@html toHTML(rotatingMessages[messageIndex])}
              </div>
            {/key}
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else}
  <span class="not-loading"> not loading </span>
{/if}

<style>
  :root {
    text-align: center;
    position: relative;
  }

  .loading-backdrop {
    z-index: 9999;
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;

    background: #f7f7f7;
    overflow: hidden;
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

  .messageContainer {
    display: block;
    position: relative;
    width: 100%;
    height: auto;
    max-width: 500px;
    text-align: center;
    margin-bottom: 6rem;
  }

  .message {
    position: absolute;
    padding: 2rem 3rem;
    text-align: center;
    width: 100%;
  }

  .loading-image {
    margin-top: -75px;
  }

  .not-loading {
    display: none;
  }

  .no-pan {
    touch-action: pan-x pan-y;
    touch-action: none;
  }
</style>
