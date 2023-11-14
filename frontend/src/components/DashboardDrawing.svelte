<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils'
  import { sharePath } from '$lib/routes'

  export let drawing
  export let challengeId
</script>

<a href={sharePath(challengeId)}>
  <img src={urlFor(drawing.image).url()} alt="" />
</a>

<style>
  img {
    width: 168px;
    height: 228px;
    flex-shrink: 0;
    border-radius: 8px;
    border: 1px solid #000;
  }
</style>
