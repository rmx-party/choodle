<script lang="ts">
  import { loading } from '$lib/store'
  import { fade, blur } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { toHTML } from '@portabletext/to-html'
  import { navigating } from '$app/stores'

  export let rotatingMessages = []

  let messageIndex = -1
  let interval: string | number | undefined

  onMount(() => {
    loading.subscribe((value) => {
      console.log(`loading state: `, value)
    })

    if (rotatingMessages && rotatingMessages.length > 0) messageIndex = 0
    interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % rotatingMessages.length
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  })
</script>

{#if $navigating || $loading}
  <div class="LoadingIndicator loading-backdrop no-pan" out:fade={{ duration: 300 }}>
    <div class="loading" transition:fade={{ duration: 300 }}>
      <img
        class="loading-image"
        height="263"
        width="174"
        src="/choodle-bob-p2.png"
        alt="A doodle of the painter Bob Ross, slightly smiling"
      />
      <div class="messageContainer">
        {#if messageIndex >= 0 && rotatingMessages.length > 0}
          {#key messageIndex}
            <div class="message" transition:fade={{ duration: 300 }}>
              {@html toHTML(rotatingMessages[messageIndex])}
            </div>
          {/key}
        {/if}
      </div>
    </div>
  </div>
{:else}
  <span class="not-loading"> not loading </span>
{/if}

<style>
  :root {
    --light-color: rgba(10, 10, 220, 0.2);
    --dark-color: rgba(10, 10, 220, 1);
    --radius: 64px;
    --ring-width: 4px;

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

    background: white;
    overflow: hidden;
  }

  /* loading element style */
  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .messageContainer {
    display: block;
    position: relative;
    width: 100%;
    max-width: 500px;
    text-align: center;
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
