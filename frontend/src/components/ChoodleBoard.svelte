<script lang="ts">
    import {loading} from "$lib/store";
    import {browser} from "$app/environment";
    import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import {onMount} from "svelte";
    import {drawColor, backgroundColour, lineWidth, pixelRatio, targetMaxSize} from "$lib/Configuration";
    import {applyRatio, maximumSize, removeOffset} from "$lib/Calculations";
    import type {Dimensiony} from "$lib/Calculations";
    import {crunchCanvasToUrl, applyCrunchToCanvas, crunchCanvasToBuffer} from "$lib/ImageUtils";
    import {goto} from "$app/navigation";
    import Prompt from "./Prompt.svelte"
    import Button from "./Button.svelte"
    import {readWriteClient} from "$lib/CMSUtils";
    import Drawer from "./Drawer.svelte";
    import {toHTML} from "@portabletext/to-html";
    import localforage from "localforage";
    import * as crypto from "crypto";

    export let id;
    export let prompt;
    export let howto;

    let isDrawing = false;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let lastTouchedPoint: Dimensiony | null;
    let isOnline = true;

    const resizeCanvas = async () => {
        canvas.style.width = `100%`
        canvas.style.height = `100%`
        const bounds = canvas.getBoundingClientRect();

        const canvasDimensions = maximumSize({x: bounds.width, y: bounds.height}, targetMaxSize)
        const ratioedCanvasDimensions = applyRatio(canvasDimensions, pixelRatio)

        window.requestAnimationFrame(async () => {
            canvas.width = ratioedCanvasDimensions.x
            canvas.height = ratioedCanvasDimensions.y
            canvas.style.width = `${canvasDimensions.x}px`
            canvas.style.height = `${canvasDimensions.y}px`
            await load()
        })
    }

    /* Drawing */
    function startDrawing(event: MouseEvent | TouchEvent) {
        isDrawing = true;
        event.preventDefault()
        const [newX, newY] = canvasCoordsFromEvent(event)
        lastTouchedPoint = {x: newX, y: newY}

        window.requestAnimationFrame(() => {
            ctx.beginPath()
            ctx.fillStyle = drawColor
        })
    }

    const doDraw = (event: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
        if (!isDrawing) return;
        lastTouchedPoint = null;

        event.preventDefault()
        drawTo(...canvasCoordsFromEvent(event));
    }

    async function endDrawing(event: MouseEvent | TouchEvent) {
        event.preventDefault()
        isDrawing = false;

        if (lastTouchedPoint) {
            ctx.fillRect(
                Math.round(lastTouchedPoint.x - lineWidth / 2), Math.round(lastTouchedPoint.y - lineWidth / 2),
                Math.round(lineWidth / 2), Math.round(lineWidth / 2)
            )
        }

        ctx.beginPath()

        await applyCrunchToCanvas(canvas, ctx)
        await push()
        await load()
    }

    function drawTo(x: number, y: number) {
        const [roundedX, roundedY] = [Math.round(x), Math.round(y)]
        console.table([{action: 'drawing', x, y, roundedX, roundedY}])

        window.requestAnimationFrame(async () => {
            ctx.lineTo(roundedX, roundedY)
            ctx.stroke();
            await applyCrunchToCanvas(canvas, ctx)
        })
    }

    function viewportCoordsFromEvent(event: MouseEvent | TouchEvent): [number, number] {
        switch (event.constructor) {
            case MouseEvent:
                return [(event as MouseEvent).clientX,
                    (event as MouseEvent).clientY]
            case TouchEvent:
                return [(event as TouchEvent).touches[0].clientX,
                    (event as TouchEvent).touches[0].clientY]
        }
        return [-1, -1] // FIXME: this is terrible
    }

    function canvasCoordsFromEvent(event: MouseEvent | TouchEvent): [number, number] {
        const box = canvas.getBoundingClientRect();
        const [viewportX, viewportY] = [...viewportCoordsFromEvent(event)]
        const offsetX = (viewportX - box.left);
        const offsetY = (viewportY - box.top);

        // Normalize the screen coordinates to a 0..1 range relative to the canvas
        // box area then re-scale by the canvas dimensions
        const newX = (offsetX / box.width) * canvas.width
        const newY = (offsetY / box.height) * canvas.height


        return [newX, newY];
    }

    const load = async () => {
        const undoStack = await getUndoStack()

        drawImageFromDataURL(undoStack.current, ctx);
        console.log(`loaded`, undoStack)
    }

    async function push() {
        const undoStack = await getUndoStack()

        const imageDataUrl = await crunchCanvasToUrl(canvas, ctx)
        undoStack.push(imageDataUrl)

        await setUndoStack(undoStack);
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

        clearCanvas(id);
        await clearStorage();
    }

    function getCreatorId() {
        try {
            const existingId = localforage.getItem('choodle-creator-id');
            if (existingId === '') {
                const uuid = crypto.randomUUID()
                localforage.setItem('choodle-creator-id', uuid)
                return uuid
            }
            return existingId
        } catch (e) {
            console.error(e)
            return 'unknown'
        }
    }

    const save = async (_event: Event) => {
        const undoStack = await getUndoStack()
        if (undoStack.current === '') return;
        loading.set(true)
        const imgBlob = await (await fetch(undoStack.current)).blob();
        const uploadResult = await readWriteClient.assets.upload('image', imgBlob)
        console.log(`uploaded: `, uploadResult)

        const choodle = {
            _type: 'choodle',
            title: 'Untitled',
            image: {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: uploadResult?._id,
                }
            },
            creatorId: getCreatorId()
        }
        const createResult = await readWriteClient.create(choodle)
        console.log(createResult)
        if (createResult._id) {
            await goto(`/choodle/${createResult._id}`)
        }
        loading.set(false)
    }

    function clearCanvas(id: string) {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = backgroundColour;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
        if (dataURL === '') clearCanvas(id)
        const image = new Image;
        image.addEventListener('load', () => {
            window.requestAnimationFrame(() => {
                clearCanvas(id)
                context.drawImage(image, 0, 0);
                context.stroke();
            })
        });
        image.src = dataURL;
    }

    onMount(async () => {
        if (!browser) return;

        canvas = document.getElementById(id) as HTMLCanvasElement;
        ctx = canvas.getContext('2d', {willReadFrequently: true})

        ctx.strokeStyle = drawColor
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'square';
        ctx.imageSmoothingEnabled = false;

        window.addEventListener('resize', resizeCanvas)
        await resizeCanvas()
        await load()

        window.addEventListener('online', () => {
            console.log('online')
            isOnline = true
        })
        window.addEventListener('offline', () => {
            console.log('offline')
            isOnline = false
        })
    });
</script>

<Drawer prompt={prompt.prompt} content={toHTML(howto.howto)}/>

<div id="buttons">
    <Button on:click={undo}>Undo</Button>
    <Button on:click={save} variant='primary' isOnline={isOnline}>Done</Button>
</div>

<canvas id={id}
        on:mousedown={startDrawing}
        on:touchstart={startDrawing}
        on:mouseup={endDrawing}
        on:touchend={endDrawing}
        on:mousemove={doDraw}
        on:touchmove={doDraw}
        on:click={(event) => {event.preventDefault()}}
        on:drag={(event) => {event.preventDefault()}}>
</canvas>

<style>
    canvas {
        position: relative;
        z-index: 100;
        align-self: stretch;
        justify-self: center;
        margin: 0 auto;
        width: 100%;
        height: 100%;

        /* minimize the amount of antialiasing effects in the canvas */
        image-rendering: optimizeSpeed; /* Older versions of FF          */
        image-rendering: -moz-crisp-edges; /* FF 6.0+                       */
        image-rendering: -webkit-optimize-contrast; /* Safari                        */
        image-rendering: -o-crisp-edges; /* OS X & Windows Opera (12.02+) */
        image-rendering: pixelated; /* Awesome future-browsers       */
        -ms-interpolation-mode: nearest-neighbor; /* IE                            */
    }

    #buttons {
        z-index: 10000;
        width: 100%;
        margin-top: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-around;
        flex-wrap: wrap;
        flex-direction: row;
        align-content: center;
        gap: 2mm;
        padding: 2mm;
    }

    #buttons button {
        font-size: 1rem;
        padding: 0.2em;
        flex-grow: 1;
        min-height: 42px;
        min-width: 42px;
    }
</style>
