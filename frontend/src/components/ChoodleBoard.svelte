<script lang="ts">
    import {loading} from "$lib/store";
    import {browser} from "$app/environment";
    import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import {onMount} from "svelte";
    import {drawColor, backgroundColour, lineWidth, targetMaxSize, upScaledImageRatio} from "$lib/Configuration";
    import {maximumSize} from "$lib/Calculations";
    import type {Dimensiony} from "$lib/Calculations";
    import {crunchCanvasToUrl, applyCrunchToCanvas} from "$lib/ImageUtils";
    import {goto} from "$app/navigation";
    import Button from "./Button.svelte"
    import {readWriteClient} from "$lib/CMSUtils";
    import localforage from "localforage";
    import Prompt from "./Prompt.svelte";

    export let id;
    export let prompt;

    let isDrawing = false;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let lastTouchedPoint: Dimensiony | null;
    let isOnline = true;

    const resetViewportUnit = async () => {
        if(!browser) return;
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    const resizeCanvas = async () => {
        if (!browser) return;
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
        if (!browser) return;
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
        if (!browser) return;
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
        if (!browser) return;
        event.preventDefault()

        clearCanvas(id);
        await clearStorage();
    }

    async function getCreatorId() {
        if (!browser) return;
        try {
            const existingId = await localforage.getItem('choodle-creator-id');
            if (existingId && existingId.length > 1) {
                return existingId
            }

            const uuid = window.crypto.randomUUID()
            await localforage.setItem('choodle-creator-id', uuid)
            return uuid
        } catch (e) {
            console.error(`getCreatorId failure, returning 'unknown'`, e)
            return 'unknown'
        }
    }

    const upScaledImageUrlBy = async (canvas, context, scale: number) => {
        if (!browser) return;
        const image = await createImageBitmap(canvas, 0, 0, canvas.width, canvas.height, {
            resizeWidth: canvas.width * scale,
            resizeHeight: canvas.height * scale,
            resizeQuality: 'pixelated'
        })
        ctx.drawImage(image, 0, 0)

        const offScreenCanvas = new OffscreenCanvas(canvas.width * scale, canvas.height * scale)
        const offScreenContext = offScreenCanvas.getContext('2d')!
        offScreenContext.drawImage(image, 0, 0)

        // FIXME: should probably close the offscreen canvas here.

        return await crunchCanvasToUrl(offScreenCanvas, offScreenContext)
    }

    const save = async (_event: Event) => {
        if (!browser) return;

        const upScaledImage = await upScaledImageUrlBy(canvas, ctx, upScaledImageRatio)
        const upScaledImageBlob = await (await fetch(upScaledImage as unknown as
        URL)).blob()
        const upScaledUploadResult = readWriteClient.assets.upload('image', upScaledImageBlob)

        const undoStack = await getUndoStack()
        if (undoStack.current === '') return;
        loading.set(true)
        const imgBlob = await (await fetch(undoStack.current)).blob();
        const uploadResult = readWriteClient.assets.upload('image', imgBlob)
        console.log(`uploaded: `, uploadResult)

        const choodle = {
            _type: 'choodle',
            title: 'Untitled',
            image: {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: (await uploadResult)?._id,
                }
            },
            upScaledImage: {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: (await upScaledUploadResult)?._id,
                }
            },
            creatorId: await getCreatorId()
        }
        const createResult = await readWriteClient.create(choodle)
        console.log(createResult)
        if (createResult._id) {
            clearCanvas(id);
            await clearStorage();

            await goto(`/c/${createResult._id}`)
        }
        loading.set(false)
    }

    function clearCanvas(id: string) {
        if (!browser) return;

        const canvas = document.getElementById(id) as HTMLCanvasElement;
        if(!canvas) return;
        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = backgroundColour;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
        if (!browser) return;
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

        setTimeout(async () => {
            await resetViewportUnit()
            await resizeCanvas()
            await load()
        }, 50)
    });
</script>

<div id="flex-container">
    <Prompt prompt={prompt.prompt}/>

    <div class="canvas-container">
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

    <div id="buttons">
        <Button on:click={undo} colour="yellow">Undo</Button>
        <Button on:click={save} isOnline={isOnline} colour="yellow">Done</Button>
    </div>
</div>

<style>
    :root {
        background-color: rgba(20, 21, 24, 0.03);
    }

    #flex-container {
        background-color: rgba(20, 21, 24, 0.03);

        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: center;
        justify-content: space-between;
        align-items: center;
        width: 100vw;
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100); /* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */
    }

    .canvas-container {
        flex-grow: 1;
        aspect-ratio: 3 / 4;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0.75rem;
        max-width: 100%;
    }

    canvas {
        flex-grow: 1;
        aspect-ratio: 3 / 4;
        /* outline: #051BDC 1px dashed; */
        max-width: 95vw;
        /* max-height: 70vh; */
        /* max-height: calc(var(--vh, 1vh) * 70); /1* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ *1/ */

        background: #FFF;
        box-shadow: 0px 0px 32px 0px rgba(0, 0, 0, 0.12), 1px 1px 1px 0px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(52px);

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
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        flex-wrap: wrap;
        flex-direction: row;
        align-content: center;
        gap: 1rem;
        padding: 0 1rem 1rem;
        margin: 0;
    }
</style>

