<script lang="ts">
    import {browser} from "$app/environment";
    import {load, push} from "$lib/StorageStuff";
    import {canvas, canvasContext, canvasCoordsFromEvent, pixelRatio} from "$lib/CanvasStuff";
    import {onMount} from "svelte";
    import {lineWidth, targetMaxSize} from "$lib/Configuration";
    import {applyRatio, maximumSize, removeOffset} from "$lib/Calculations";

    export let id;

    let isDrawing = false;

    const resizeCanvas = async (_event?: Event) => {
        const bounds = canvas().getBoundingClientRect();
        const viewportHeight = canvas().parentElement?.clientHeight - bounds.y
        const viewportWidth = canvas().parentElement?.clientWidth - bounds.x

        const canvasDimensions = maximumSize({x: viewportWidth, y: viewportHeight}, targetMaxSize)
        const offsetCanvasDimensions = removeOffset(canvasDimensions, {x: bounds.x, y: bounds.y})
        const ratioedCanvasDimensions = applyRatio(offsetCanvasDimensions, pixelRatio())

        canvas().width = ratioedCanvasDimensions.x
        canvas().height = ratioedCanvasDimensions.y
        canvas().style.width = `${canvasDimensions.x}px`
        canvas().style.height = `${canvasDimensions.y}px`

        await load()
    }

    /* Drawing */
    function startDrawing(event: MouseEvent | TouchEvent) {
        isDrawing = true;
        event.preventDefault()
        console.groupCollapsed('drawing')
        const [newX, newY] = canvasCoordsFromEvent(event)

        canvasContext().beginPath()
        drawTo(newX + 1, newY + 1)
        canvasContext().closePath()
    }

    const doDraw = (event: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
        if (!isDrawing) return;

        event.preventDefault()
        drawTo(...canvasCoordsFromEvent(event));
        console.log(event)
    }

    async function endDrawing(event: MouseEvent | TouchEvent) {
        const context = canvasContext()
        event.preventDefault()
        isDrawing = false;
        await push()
        context.beginPath()
        console.groupEnd()
    }

    const drawTo = (x: number, y: number): void => {
        const context = canvasContext()
        context.imageSmoothingEnabled = false;

        console.log(`drawing a line to ${x} ${y}`)

        window.requestAnimationFrame(() => {
            context.lineTo(x, y)
            context.stroke();
        })
    }

    onMount(async () => {
        if (!browser) return;

        const context = canvasContext()
        context.strokeStyle = 'black'
        context.lineWidth = lineWidth;
        context.lineCap = 'square';
        context.imageSmoothingEnabled = false;

        await resizeCanvas()

        await load()
    });
</script>

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