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

        await resizeCanvas()

        await load()
    });
</script>

<canvas id="choodle-board" style="border: 1px solid lawngreen"></canvas>