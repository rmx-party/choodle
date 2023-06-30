<script lang="ts">
    import {loading, tokenId} from "$lib/store";

    let tokenIdValue;
    let loadingValue;

    tokenId.subscribe(value => {
        tokenIdValue = value
    })

    loading.subscribe(value => {
        loadingValue = value
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
    import {goto} from "$app/navigation";

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
        loadingValue = true
        tokenIdValue = await connectAndMint()
        await goto(`/viewToken/${tokenIdValue}`)
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

{#if !loadingValue}
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
    <canvas id="choodle-board"></canvas>
{:else}
    <style>
        :root {
            --light-color: rgba(10, 10, 220, .2);
            --dark-color: rgba(10, 10, 220, 1);
            --radius: 64px;
            --ring-width: 4px;
        }

        /* loading element style */
        .loading {
            margin: 0;
            padding: 0;
            width: var(--radius);
            height: var(--radius);
            border-radius: 50%;
            border: var(--ring-width) solid var(--light-color);
        }

        .loading:before {
            margin: 0;
            padding: 0;
            display: block;
            position: relative;
            left: calc(var(--ring-width) * -2);
            top: calc(var(--ring-width) * -2);
            content: ' ';
            width: var(--radius);
            height: var(--radius);
            border-radius: 50%;
            border: var(--ring-width) solid;
            border-color: var(--dark-color) transparent transparent transparent;
            animation: loading-rotate .8s ease-out infinite;
        }

        @keyframes loading-rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    </style>

    <div id="loading" class="loading"></div>
{/if}