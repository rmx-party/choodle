import {getUndoStack} from "$lib/StorageStuff";
import {pixelRatio} from "$lib/Configuration";

export function clearCanvas(id: string) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
}

function logStateOfImage(dataURL: string) {
    console.log('image loaded', dataURL)
    console.log('size in KB', dataURL.length / 1024)
    console.log('pixelRatio', pixelRatio)
    console.log('canvas', canvas().width, canvas().height)
}

export async function logCurrentState() {
    const undoStack = await getUndoStack()
    const dataURL = undoStack.last
    logStateOfImage(dataURL);
}

export function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
    const image = new Image;
    clearCanvas('choodle-board') // FIXME: this should not be hard-coded
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
