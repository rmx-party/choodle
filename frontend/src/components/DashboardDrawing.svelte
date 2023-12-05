<script lang="ts">
  import type { Drawing } from '@prisma/client'
  import { fade } from 'svelte/transition'

  export let index: number
  export let drawing: Drawing
  export let linkDestination: string
</script>

<a class="drawing" href={linkDestination} transition:fade={{ duration: 100 }}>
  <img
    loading={index <= 16 ? 'eager' : 'lazy'}
    src={drawing.imageUrl}
    alt=""
    width="168"
    height="228"
  />
</a>

<style>
  .drawing {
    flex-shrink: 0;
    display: block;
  }
  img {
    width: var(--drawing-grid-img-width);
    height: var(--drawing-grid-img-height);
    border-radius: 8px;
    border: 1px solid #000;
    image-rendering: pixelated;
  }
</style>
