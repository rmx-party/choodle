<script lang="ts">
    import {clearCanvas, drawImageFromDataURL} from "$lib/CanvasStuff.ts";
    import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff.js";
    import {loading, tokenId} from "$lib/store.js";
    import {connectAndMint} from "$lib/MagicStuff.js";
    import {goto} from "$app/navigation";
    import {browser} from "$app/environment";
    import {onMount} from "svelte";

    export let choodleBoardId

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;


    function canShare(): boolean {
        if (browser) return !!navigator.share
        return false
    }

    const undo = async (event: Event) => {
        event.preventDefault()

        const undoStack = await getUndoStack()
        undoStack.undo()

        await setUndoStack(undoStack);

        const dataURL = undoStack.current

        drawImageFromDataURL(dataURL, ctx)
    }

    const redo = async (event: Event) => {
        event.preventDefault()

        const undoStack = await getUndoStack()
        undoStack.redo()

        await setUndoStack(undoStack);

        drawImageFromDataURL(undoStack.current, ctx)
    }

    const clear = async (event: Event) => {
        event.preventDefault()

        clearCanvas('choodle-board');  // FIXME: this should not be hard-coded
        await clearStorage();
    }

    const mint = async (event: Event) => {
        event.preventDefault()
        loading.set(true)
        tokenId.set(await connectAndMint())
        await goto(`/viewToken/${$tokenId}`)
    }

    const share = async (event: Event) => {
        event.preventDefault()

        const imgBlob = await (await fetch(canvas.toDataURL("image/png", 1.0))).blob();
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

    onMount(async () => {
        if (!browser) return;

        canvas = document.getElementById(choodleBoardId) as HTMLCanvasElement;
        ctx = canvas.getContext('2d')
    });
</script>

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
