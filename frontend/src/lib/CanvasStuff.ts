import {applyRatio, maximumSize, removeOffset} from "$lib/Calculations";
import {getUndoStack, load, push} from "$lib/StorageStuff";
import {targetMaxSize} from "$lib/Configuration";


export const resizeCanvas = async (_event?: Event) => {
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

export function clearDisplay() {
    canvasContext().clearRect(0, 0, canvas().width, canvas().height);
    canvasContext().fillStyle = "#ffffff";
    canvasContext().fillRect(0, 0, canvas().width, canvas().height);
    canvasContext().imageSmoothingEnabled = false;
}

function logStateOfImage(dataURL: string) {
    console.log('image loaded', dataURL)
    console.log('size in KB', dataURL.length / 1024)
    console.log('pixelRatio', pixelRatio())
    console.log('canvas', canvas().width, canvas().height)
}

export async function logCurrentState() {
    const undoStack = await getUndoStack()
    const dataURL = undoStack.last
    logStateOfImage(dataURL);
}

export function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
    const image = new Image;
    clearDisplay()
    image.addEventListener('load', () => {
        context.drawImage(image, 0, 0);
        context.stroke();
        logStateOfImage(dataURL)
    });
    image.src = dataURL;
}

export function canvas() {
    let instance = null;
    instance ||= document.getElementById('choodle-board') as HTMLCanvasElement;
    return instance
}

export function canvasContext() {
    return canvas().getContext('2d')!
}

export function pixelRatio(): number {
    return 0.35;
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

export function canvasCoordsFromEvent(event: MouseEvent | TouchEvent): [number, number] {
    const box = canvas().getBoundingClientRect();
    const [viewportX, viewportY] = [...viewportCoordsFromEvent(event)]
    const offsetX = (viewportX - box.left);
    const offsetY = (viewportY - box.top);

    // Normalize the screen coordinates to a 0..1 range relative to the canvas
    // box area then re-scale by the canvas dimensions
    const newX = (offsetX / box.width) * canvas().width
    const newY = (offsetY / box.height) * canvas().height


    return [newX, newY];
}
