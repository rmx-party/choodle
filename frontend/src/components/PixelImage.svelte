<script lang="ts">
  export let src: string;
  export let alt: string;
  export let fontSize = 'inherit';
</script>

<img class="pixel-image" {src} {alt} style:font-size={fontSize} {...$$restProps} />

<style>
  .pixel-image {
    image-rendering: pixelated;
  }
</style>
