<script lang="ts">
    import {browser} from "$app/environment";
    import {load, push} from "$lib/StorageStuff";
    import {canvasContext, canvasCoordsFromEvent, resizeCanvas} from "$lib/CanvasStuff";
    import {onMount} from "svelte";
    import {lineWidth} from "$lib/Configuration";

    let isDrawing = false;

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

<canvas id="choodle-board" style="border: 1px solid lawngreen"
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