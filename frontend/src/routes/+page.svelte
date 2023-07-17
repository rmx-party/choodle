<script lang="ts">
    import {loading, tokenId} from "$lib/store";
    import LoadingIndicator from "../LoadingIndicator.svelte";

    import {
        canShare, canvas, canvasContext,
        clearDisplay, drawImageFromDataURL,
        initialize
    } from "$lib/CanvasStuff.ts";
    import {connectAndMint, generateOpenSeaURL} from "$lib/MagicStuff";
    import {goto} from "$app/navigation";
    import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import ChoodleBoard from "../ChoodleBoard.svelte";

    const undo = async (event: Event) => {
        event.preventDefault()

        const undoStack = await getUndoStack()
        undoStack.undo()

        await setUndoStack(undoStack);

        const dataURL = undoStack.current

        drawImageFromDataURL(dataURL, canvasContext())
    }

    const redo = async (event: Event) => {
        event.preventDefault()

        const undoStack = await getUndoStack()
        undoStack.redo()

        await setUndoStack(undoStack);

        drawImageFromDataURL(undoStack.current, canvasContext())
    }

    const clear = async (event: Event) => {
        event.preventDefault()

        clearDisplay();
        await clearStorage();
    }

    export const mint = async (event: Event) => {
        event.preventDefault()
        loading.set(true)
        tokenId.set(await connectAndMint())
        await goto(`/viewToken/${$tokenId}`)
    }

    const share = async (event: Event) => {
        event.preventDefault()

        const imgBlob = await (await fetch(canvas().toDataURL("image/png", 1.0))).blob();
        const files = [
            new File(
                [imgBlob],
                'choodle.png',
                {
                    type: 'image/png',
                    lastModified: Date.now()
                }
            )
        ];
        if (navigator.share) {
            navigator.share({
                files
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        } else {
            console.error('Web Share API not supported')
        }
    };

    initialize()
</script>

{#if !$loading}
    <div id="buttons">
        <button id="undo" on:click={undo}>Undo</button>
        <button id="redo" on:click={redo}>Redo</button>
        <button id="clear-board" on:click={clear}>Clear</button>
        <!-- <a id="download" href="/api/download">Download</a> -->
        <button id="mint" on:click={mint}>Mint</button>
        {#if canShare()}
            <button id="share" on:click={share}>Share</button>
        {/if}
    </div>
    <ChoodleBoard></ChoodleBoard>
{:else}
    <LoadingIndicator></LoadingIndicator>
{/if}

