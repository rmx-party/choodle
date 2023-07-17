<script lang="ts">
    import {browser} from "$app/environment";
    import {load} from "$lib/StorageStuff";
    import {canvasContext, doDraw, endDrawing, resizeCanvas, startDrawing} from "$lib/CanvasStuff";
    import {onMount} from "svelte";
    import {lineWidth} from "$lib/Configuration";

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