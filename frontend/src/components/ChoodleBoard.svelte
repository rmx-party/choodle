<script lang="ts">
    import {loading, loadingMessage} from "$lib/store";
    import {browser} from "$app/environment";
    import {getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import {onMount} from "svelte";
    import {
        drawColor,
        backgroundColour,
        lineWidth,
        targetMaxSize,
    } from "$lib/Configuration";
    import {maximumSize} from "$lib/Calculations";
    import type {Dimensiony} from "$lib/Calculations";
    import {crunchCanvasToUrl, applyCrunchToCanvas} from "$lib/ImageUtils";
	import fp from "lodash/fp";

    export let id: string;

    export let performSave = (..._args) => null;

    export let afterSave = (..._args) => null;

    let isDrawing = false;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let lastTouchedPoint: Dimensiony | null;

    /* Actions */
    const load = async () => {
        if (!ctx) throw new Error(`ctx is null`);

        const undoStack = await getUndoStack();
        drawImageFromDataURL(undoStack.current, ctx);
        console.log(`loaded`, undoStack)
    }

    const push = async () => {
        const undoStack = await getUndoStack()

        const imageDataUrl = await crunchCanvasToUrl(canvas, ctx)
        undoStack.push(imageDataUrl)

        await setUndoStack(undoStack);
    };

    export const undo = async (event: Event) => {
        event.preventDefault()

        const undoStack = await getUndoStack()
        undoStack.undo()

        await setUndoStack(undoStack);

        const dataURL = undoStack.current

        drawImageFromDataURL(dataURL, ctx)
    }


    export const save = async (_event: Event) => {
        if (!browser) return;

        const undoStack = await getUndoStack()
        if (undoStack.current === '') return loading.set(false);

        loadingMessage.set('saving your choodle')
        loading.set(true)
        const createResult = await performSave(undoStack, canvas);

        clearCanvas(id)
        await afterSave(createResult)

        loading.set(false)
    }

    /* Canvas Resizing */
    const resetViewportUnit = async () => {
        if (!browser) return;
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
        //console.table([{action: 'drawing', x, y, roundedX, roundedY}])

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

    export function clearCanvas(id: string) {
        if (!browser) return;

        const canvas = document.getElementById(id) as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = backgroundColour;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const drawImageFromDataURL = (dataURL: string, context: CanvasRenderingContext2D) => {
        if (!browser) return;
        if (!context) throw new Error(`context is null`);
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
    };

    onMount(async () => {
        if (!browser) return;

        // Explicitly reset bg color since it sticks after being set on next page and then navigating back
        let root = document.documentElement;
        root.style.setProperty('--page-background-color', 'rgba(20, 21, 24, 0.03)');

        canvas = document.getElementById(id) as HTMLCanvasElement;
        ctx = canvas.getContext('2d', {willReadFrequently: true})!

        ctx.strokeStyle = drawColor
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'square';
        ctx.imageSmoothingEnabled = false;

        window.addEventListener('resize', 
          (fp.debounce(100, () => {
            resizeCanvas() 
            resetViewportUnit()
        })))

        await resetViewportUnit()
        await resizeCanvas()
    });
</script>

<div id="flex-container">
    <slot name="prompt"/>

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

    <slot name="buttons"/>
</div>

<slot/>

<style>
    :global(:root) {
        --page-background-color: rgba(20, 21, 24, 0.03);
    }

    #flex-container {
        background-color: rgba(20, 21, 24, 0.03);

        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        align-content: center;
        justify-content: space-between;
        align-items: center;
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
</style>

