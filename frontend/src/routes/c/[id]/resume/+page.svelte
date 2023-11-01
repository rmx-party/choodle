<script lang="ts">
  import { urlFor } from '$lib/PersistedImagesUtils';
  import { readBlob } from '$lib/ImageUtils';
  import { clearStorage, getUndoStack, setUndoStack } from '$lib/StorageStuff';
  import { goto } from '$app/navigation';
  import Button from '../../../../components/Button.svelte';
  import LayoutContainer from '../../../../components/LayoutContainer.svelte';
  import MetaData from '../../../../components/MetaData.svelte';
  import { page } from '$app/stores';
  import { choodleYellow } from '$lib/Configuration';
  import ChoodleContainer from '../../../../components/ChoodleContainer.svelte';

  export let data;

  const resume = async () => {
    console.log(data.choodle);
    const blob = await (await fetch(urlFor(data.choodle.image).url() as unknown as URL)).blob();
    const imgUrl = await readBlob(blob);
    await clearStorage();
    const undoStack = await getUndoStack();
    undoStack.push(imgUrl);
    await setUndoStack(undoStack);
    await goto('/game/squiggles/draw');
  };
</script>

<MetaData
  url={$page.url}
  title="Look, it's a Choodle"
  imageUrl={urlFor(data.choodle.upScaledImage).url()}
  themeColor={choodleYellow}
  width="430"
  height="932"
/>

<LayoutContainer>
  <ChoodleContainer>
    <img src={urlFor(data.choodle.upScaledImage).url()} width="390" height="520" alt="" />
  </ChoodleContainer>

  <Button variant="big primary" on:click={resume}>Resume This Choodle</Button>
</LayoutContainer>
