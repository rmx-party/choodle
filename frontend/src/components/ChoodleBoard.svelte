<script lang="ts">
    import {loading} from "$lib/store";
    import {browser} from "$app/environment";
    import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import {onMount} from "svelte";
    import {drawColor, backgroundColour, lineWidth, targetMaxSize} from "$lib/Configuration";
    import {maximumSize} from "$lib/Calculations";
    import type {Dimensiony} from "$lib/Calculations";
    import {crunchCanvasToUrl, applyCrunchToCanvas} from "$lib/ImageUtils";
    import {goto} from "$app/navigation";
    import Button from "./Button.svelte"
    import {readWriteClient} from "$lib/CMSUtils";
    import localforage from "localforage";

    export let id;

    let isDrawing = false;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let lastTouchedPoint: Dimensiony | null;
    let isOnline = true;

    const resetViewportUnit = async () => {
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    const resizeCanvas = async () => {
        const bounds = canvas.getBoundingClientRect();

        const canvasDimensions = maximumSize({x: bounds.width, y: bounds.height}, targetMaxSize)

        window.requestAnimationFrame(async () => {
            canvas.width = canvasDimensions.x
            canvas.height = canvasDimensions.y
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
                Math.round(lastTouchedPoint.x - lineWidth * 2),
                Math.round(lastTouchedPoint.y - lineWidth * 2),
                Math.round(lineWidth * 2), Math.round(lineWidth * 2)
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

    async function getCreatorId() {
        try {
            const existingId = await localforage.getItem('choodle-creator-id');
            if (existingId && existingId.length > 1) {
                return existingId
            }

            const uuid = window.crypto.randomUUID()
            localforage.setItem('choodle-creator-id', uuid)
            return uuid
        } catch (e) {
            console.error(`getCreatorId failure, returning 'unknown'`, e)
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
            creatorId: await getCreatorId()
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

        await resetViewportUnit()
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
        window.addEventListener('resize', () => {
            resizeCanvas() // TODO: debounce
            resetViewportUnit()
        })
    });
</script>

<div id="flex-container">
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
</div>

<style>
    #flex-container {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: center;
        justify-content: space-between;
        align-items: center;
        width: 100vw;
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100) /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */
    }

    canvas {
        flex-grow: 1;
        object-fit: contain;

        /* minimize the amount of antialiasing effects in the canvas */
        image-rendering: optimizeSpeed; /* Older versions of FF */
        image-rendering: -moz-crisp-edges; /* FF 6.0+ */
        image-rendering: -webkit-optimize-contrast; /* Safari */
        image-rendering: -o-crisp-edges; /* OS X & Windows Opera (12.02+) */
        image-rendering: pixelated; /* Awesome future-browsers */
        -ms-interpolation-mode: nearest-neighbor; /* IE */
    }

    #buttons {
        width: 100%;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
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
