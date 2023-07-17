<script lang="ts">
    import {browser} from "$app/environment";
    import {getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import {onMount} from "svelte";
    import {lineWidth, pixelRatio, targetMaxSize} from "$lib/Configuration";
    import {applyRatio, maximumSize, removeOffset} from "$lib/Calculations";
    import ChoodleBoardButtons from "./ChoodleBoardButtons.svelte";
    import {drawImageFromDataURL} from "$lib/CanvasStuff";
    import {crunchCanvas} from "$lib/ImageUtils";

    export let id;

    let isDrawing = false;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const resizeCanvas = async () => {
        const bounds = canvas.getBoundingClientRect();
        const viewportHeight = canvas.parentElement?.clientHeight - bounds.y
        const viewportWidth = canvas.parentElement?.clientWidth - bounds.x

        const canvasDimensions = maximumSize({x: viewportWidth, y: viewportHeight}, targetMaxSize)
        const offsetCanvasDimensions = removeOffset(canvasDimensions, {x: bounds.x, y: bounds.y})
        const ratioedCanvasDimensions = applyRatio(offsetCanvasDimensions, pixelRatio)

        canvas.width = ratioedCanvasDimensions.x
        canvas.height = ratioedCanvasDimensions.y
        canvas.style.width = `${canvasDimensions.x}px`
        canvas.style.height = `${canvasDimensions.y}px`
        await load()
    }

    /* Drawing */
    function startDrawing(event: MouseEvent | TouchEvent) {
        isDrawing = true;
        event.preventDefault()
        console.groupCollapsed('drawing')
        const [newX, newY] = canvasCoordsFromEvent(event)

        ctx.beginPath()
        drawTo(newX + 1, newY + 1)
        ctx.closePath()
    }

    const doDraw = (event: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
        if (!isDrawing) return;

        event.preventDefault()
        drawTo(...canvasCoordsFromEvent(event));
        console.log(event)
    }

    async function endDrawing(event: MouseEvent | TouchEvent) {
        event.preventDefault()
        isDrawing = false;
        await push()
        ctx.beginPath()
        console.groupEnd()
    }

    const drawTo = (x: number, y: number): void => {
        ctx.imageSmoothingEnabled = false;

        console.log(`drawing a line to ${x} ${y}`)

        window.requestAnimationFrame(() => {
            ctx.lineTo(x, y)
            ctx.stroke();
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

        drawImageFromDataURL(undoStack.last, ctx);
        console.log(`loaded`, undoStack)
    }

    async function push() {
        const undoStack = await getUndoStack()

        const imageDataUrl = await crunchCanvas(canvas, ctx)
        undoStack.push(imageDataUrl)

        await setUndoStack(undoStack);
    }

    onMount(async () => {
        if (!browser) return;

        canvas = document.getElementById(id) as HTMLCanvasElement;
        ctx = canvas.getContext('2d')

        ctx.strokeStyle = 'black'
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'square';
        ctx.imageSmoothingEnabled = false;

        await resizeCanvas()

        await load()
    });
</script>

<ChoodleBoardButtons choodleBoardId={id}></ChoodleBoardButtons>
<canvas id={id} style="border: 1px solid lawngreen"
        on:mousedown={startDrawing}
        on:touchstart={startDrawing}
        on:mouseup={endDrawing}
        on:touchend={endDrawing}
        on:mousemove={doDraw}
        on:touchmove={doDraw}
        on:click={(event) => {event.preventDefault()}}
        on:drag={(event) => {event.preventDefault()}}
        on:resize={resizeCanvas}>
</canvas>