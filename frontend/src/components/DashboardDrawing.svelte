<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils'

  export let drawing
</script>

<img src={urlFor(drawing.image).url()} alt="" />

<style>
  img {
    width: 168px;
    height: 228px;
    flex-shrink: 0;
    border-radius: 8px;
    border: 1px solid #000;
  }
</style>
