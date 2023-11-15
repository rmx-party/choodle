<script lang="ts">
  import type { StreakGuessingGameDrawing } from '$lib/CWFGame'
  import { urlFor } from '$lib/PersistedImagesUtils'

  export let drawing: StreakGuessingGameDrawing
  export let linkDestination: string
</script>

<a href={linkDestination}>
  <img loading="lazy" src={urlFor(drawing.image).url()} alt="" width="168" height="228" />
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
