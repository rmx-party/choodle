<script lang="ts">
    import {tokenId} from "$lib/store";

    let tokenIdValue;

    tokenId.subscribe(value => {
        tokenIdValue = value
    })

    import {
        canShare, canvas, canvasContext,
        clearDisplay, clearStorage,
        drawImageFromDataURL,
        getUndoStack,
        initialize,
        setUndoStack
    } from "$lib/CanvasStuff.ts";
    import {connectAndMint, generateOpenSeaURL} from "$lib/MagicStuff";

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

        tokenIdValue = await connectAndMint()
    }

    const choodleAgain = async (event: Event) => {
        tokenId.set(null)
        window.location.reload()
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
{#if !tokenIdValue}
    <canvas id="choodle-board"></canvas>
{:else}
    <div id="openSeaLink" style="z-index: 999">
        <p>You can view your minted choodle on <a href="{generateOpenSeaURL(tokenIdValue)}" target="_blank">OpenSea</a>.
        </p>
        <p><a href="#" on:click={choodleAgain}>Choodle again.</a></p>
    </div>
{/if}