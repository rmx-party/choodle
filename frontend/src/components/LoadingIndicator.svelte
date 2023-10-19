<script lang="ts">
  import {loading, loadingMessage} from "$lib/store";
  import { fade, blur } from "svelte/transition";
  import AnimatedEllipses from "./AnimatedEllipses.svelte";
	import { onMount } from "svelte";

  onMount(() => {
    loading.subscribe(value => {
      console.log(`loading state: `, value)
    })
  })
</script>

{#if $loading}
  <div class="LoadingIndicator loading-backdrop" transition:blur={{duration: 150}}>
    <div class="loading" in:fade={{delay: 500, duration: 50}}>
      <img class="loading-image" height="263" width="174" src='/choodle-bob-p2.png'
        alt="A doodle of the painter Bob Ross, slightly smiling"/>
      <strong>
        {#if $loadingMessage.length > 0}
          <span>{$loadingMessage}<AnimatedEllipses/></span>
        {/if}
      </strong>
    </div>
  </div>
{:else}
  <span class="not-loading">
    not loading
  </span>
{/if}

<style>
    :root {
        --light-color: rgba(10, 10, 220, .2);
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

    strong {
        margin-top: 2.5rem;
        text-align: left;
    }

    .loading-image {
        margin-top: -75px;
    }

    .not-loading {
        display: none;
    }
</style>
