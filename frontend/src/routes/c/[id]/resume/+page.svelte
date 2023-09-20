<script lang="ts">
  import {urlFor} from "$lib/PersistedImagesUtils";
  import {readBlob} from "$lib/ImageUtils";
  import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff";
  import {goto} from "$app/navigation";
  import Button from "../../../../components/Button.svelte";

  export let data;

  const resume = async () => {
    console.log(data.choodle)
    const blob = await (await fetch(urlFor(data.choodle.image).url() as unknown as URL)).blob()
    const imgUrl = await readBlob(blob)
    await clearStorage()
    const undoStack = await getUndoStack()
    undoStack.push(imgUrl)
    await setUndoStack(undoStack);
    await goto('/draw')
  }
</script>

<div class="container">
  <div class="choodle-container">
    <img class="choodle" src={urlFor(data.choodle.upScaledImage).url()}
      width='390' height='520' alt=''/>
  </div>

  <menu>
    <Button variant="big primary" on:click={resume}>Resume This Choodle</Button>
  </menu>
</div>

<style>
    :root {
        text-align: center;
    }

    .container {
        /* gap: 2rem; */
        padding: 1rem 1rem;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: stretch;
        align-items: stretch;
        justify-content: space-between;
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */
        width: 100%;
        padding: 1.5rem;
    }

    menu {
        display: flex;
        flex-direction: row;
        margin: 1rem 0;
        padding: 0;
        gap: 1rem;
    }

    .choodle-container {
        flex-grow: 1;
        margin: 2rem auto;
        display: flex;
        align-items: center;
        padding: 0;
        flex-grow: 1;
        flex-shrink: 1;
        max-height: 50%;
        max-width: 100%;
        aspect-ratio: 3/4;
    }
    img.choodle {
        flex-shrink: 1;
        flex-grow: 1;
        max-height: 100%;
        max-width: 100%;
        image-rendering: pixelated;

        border-radius: 0.22175rem;
        box-shadow: 1px 1px 17.74193572998047px 0.8870968222618103px rgba(0, 0, 0, 0.12);
    }

    .tagline {
        margin-top: 0rem;
    }
</style>
