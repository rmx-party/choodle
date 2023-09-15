<script lang="ts">
    import {onMount} from "svelte";
    import {urlFor} from "$lib/PersistedImagesUtils";
    import {readBlob} from "$lib/ImageUtils";
    import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import {goto} from "$app/navigation";
    import Button from "../../../components/Button.svelte";

    export let data;

    const resume = async () => {
        console.log(data.choodle)
        const blob = await (await fetch(urlFor(data.choodle.image) as URL)).blob()
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
        <img class="choodle" src={urlFor(data.choodle.upScaledImage)}
             width='390' height='520' alt=''/>
    </div>

    <Button variant="big primary yellow" on:click={resume}>Resume This Choodle</Button>
</div>
