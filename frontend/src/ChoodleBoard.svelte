<script lang="ts">
    import {browser} from "$app/environment";
    import {clearStorage, getUndoStack, setUndoStack} from "$lib/StorageStuff";
    import {onMount} from "svelte";
    import {backgroundColour, lineWidth, pixelRatio, targetMaxSize} from "$lib/Configuration";
    import {applyRatio, maximumSize, removeOffset} from "$lib/Calculations";
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

        ctx.fillStyle = "#000000"
        ctx.fillRect(newX - 1, newY - 1, lineWidth / 2, lineWidth / 2)
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

    function canShare(): boolean {
        if (browser) return !!navigator.share
        return false
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

    const share = async (event: Event) => {
        event.preventDefault()

        const imgBlob = await (await fetch(canvas.toDataURL("image/png", 1.0))).blob();
        const files = [
            new File(
                [imgBlob],
                'choodle.png',
                {
                    type: 'image/png',
                    lastModified: Date.now()
                }
            )
        ];
        if (navigator.share) {
            navigator.share({
                files
            }).then(() => {
                console.log('Thanks for sharing!');
            }).catch(console.error);
        } else {
            console.error('Web Share API not supported')
        }
    };

    function clearCanvas(id: string) {
        const canvas = document.getElementById(id) as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = backgroundColour;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
    }

    function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
        const image = new Image;
        clearCanvas(id)
        image.addEventListener('load', () => {
            context.drawImage(image, 0, 0);
            context.stroke();
        });
        image.src = dataURL;
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

<div id="buttons">
    <button id="undo" on:click={undo}>Undo</button>
    <button id="redo" on:click={redo}>Redo</button>
    <button id="clear-board" on:click={clear}>Clear</button>
    {#if canShare()}
        <button id="share" on:click={share}>Share</button>
    {/if}
</div>
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