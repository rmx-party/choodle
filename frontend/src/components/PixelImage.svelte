<script lang="ts">
  export let src: string
  export let alt: string
  export let height: number | string = 'auto'
  export let width: number | string = 'auto'
  export let fontSize = 'inherit'
</script>

<img
  class="pixel-image"
  {height}
  style:height={`${height}px`}
  {width}
  style:width={`${width}px`}
  {src}
  {alt}
  style:font-size={fontSize}
  {...$$restProps}
/>

<style>
  .pixel-image {
    /* minimize the amount of antialiasing effects in the canvas */
    image-rendering: optimizeSpeed; /* Older versions of FF */
    image-rendering: -moz-crisp-edges; /* FF 6.0+ */
    image-rendering: -webkit-optimize-contrast; /* Safari */
    image-rendering: -o-crisp-edges; /* OS X & Windows Opera (12.02+) */
    image-rendering: pixelated; /* Awesome future-browsers */
    -ms-interpolation-mode: nearest-neighbor; /* IE */
  }
</style>
