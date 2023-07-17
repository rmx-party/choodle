<script lang="ts">
    import {browser} from "$app/environment";
    import {load} from "$lib/StorageStuff";
    import {canvas, canvasContext, doDraw, endDrawing, lineWidth, resizeCanvas, startDrawing} from "$lib/CanvasStuff";
    import {onMount} from "svelte";

    onMount(async () => {
        if (!browser) return;

        const context = canvasContext()
        context.strokeStyle = 'black'
        context.lineWidth = lineWidth;
        context.lineCap = 'square';
        context.imageSmoothingEnabled = false;

        await resizeCanvas()

        canvas().addEventListener('mousedown', startDrawing);
        canvas().addEventListener('touchstart', startDrawing);

        canvas().addEventListener('mouseup', endDrawing(canvasContext()));
        canvas().addEventListener('touchend', endDrawing(canvasContext()));

        canvas().addEventListener('mousemove', doDraw);
        canvas().addEventListener('touchmove', doDraw);

        canvas().addEventListener('click', event => {
            event.preventDefault()
        });
        canvas().addEventListener('drag', event => {
            event.preventDefault()
        });

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('DOMContentLoaded', resizeCanvas, false);

        setTimeout(resizeCanvas, 15) // FIXME: this sucks.
        setTimeout(() => load(), 25) // FIXME: me too, even worse
    });
</script>

<canvas id="choodle-board" style="border: 1px solid lawngreen"></canvas>