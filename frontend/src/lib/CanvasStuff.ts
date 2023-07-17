import {browser} from '$app/environment';
import localforage from 'localforage';
import {UndoStack} from "$lib/UndoStack";
import {crunchCanvas} from "$lib/ImageUtils";

/* Configuration */
const lineWidth = 5;
const targetMaxSize: Dimensiony = {x: 420, y: 746}

let isDrawing = false;

const choodleUndoKey = 'choodle-undo'

export function canShare(): boolean {
    if (browser) return !!navigator.share
    return false
}

/* Drawing */
export function startDrawing(event: MouseEvent | TouchEvent) {
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

export function endDrawing(context: CanvasRenderingContext2D) {
    return async (event: Event) => {
        event.preventDefault()
        isDrawing = false;
        await push()
        context.beginPath()
        console.groupEnd()
    };
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

export function clearStorage() {
    localforage.keys().then((keys) => {
        keys.map(async (key) => {
            await localforage.removeItem(key)
        })
    })
}

export function clearDisplay() {
    canvasContext().clearRect(0, 0, canvas().width, canvas().height);
    canvasContext().fillStyle = "#ffffff";
    canvasContext().fillRect(0, 0, canvas().width, canvas().height);
    canvasContext().imageSmoothingEnabled = false;
}

export async function logState() {
    const undoStack = await getUndoStack()
    const dataURL = undoStack.last
    console.log('image loaded', dataURL)
    console.log('size in KB', dataURL.length / 1024)
    console.log('pixelRatio', pixelRatio())
    console.log('canvas', canvas().width, canvas().height)
}

export function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
    const image = new Image;
    clearDisplay()
    image.addEventListener('load', () => {
        context.drawImage(image, 0, 0);
        context.stroke();
        console.log('image loaded', image)
        console.log('size in KB', dataURL.length / 1024)
        console.log('pixelRatio', pixelRatio())
    });
    image.src = dataURL;
}

export const load = async () => {
    const undoStack = await getUndoStack()

    drawImageFromDataURL(undoStack.last, canvasContext());
    console.log(`loaded`, undoStack)
}

export function canvas() {
    let instance = null;
    instance ||= document.getElementById('choodle-board') as HTMLCanvasElement;
    return instance
}

export function canvasContext() {
    return canvas().getContext('2d')!
}

export async function setUndoStack(undoStack: UndoStack) {
    await localforage.setItem(choodleUndoKey, undoStack.storable)
}

export async function getUndoStack() {
    return UndoStack.fromStorable(await localforage.getItem(choodleUndoKey));
}

export async function push() {
    const undoStack = await getUndoStack()

    const imageDataUrl = await crunchCanvas(canvas(), canvasContext())
    undoStack.push(imageDataUrl)

    await setUndoStack(undoStack);
    logState()
}

export function pixelRatio(): number {
    return 0.35;
}

export type Dimensiony = {
    x: number;
    y: number;
}

function getWidth(length, ratio) {
    const width = length / (1 / ratio);
    return Math.floor(width);
}

function getHeight(length, ratio) {
    const height = length * (1 / ratio);
    return Math.floor(height);
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const targetRatio = maxWidth / maxHeight
    const srcRatio = srcWidth / srcHeight

    if (srcRatio === targetRatio) {
        console.log('srcR == targetR')
        return {x: Math.floor(srcWidth), y: Math.floor(srcHeight)}
    }
    if (srcRatio > targetRatio) {
        console.log("srcR > targetR")
        // scale down width
        return {x: getWidth(srcHeight, targetRatio), y: Math.floor(srcHeight)}
    } else {
        console.log("srcR !> targetR")
        return {x: Math.floor(srcWidth), y: getHeight(srcWidth, targetRatio)}
    }

    return {x: Math.floor(srcWidth), y: Math.floor(srcHeight * (srcWidth * targetRatio))};
}


export function maximumSize(desiredSize: Dimensiony, maxSize: Dimensiony): Dimensiony {
    if (desiredSize.x < maxSize.x || desiredSize.y < maxSize.y) {
        return calculateAspectRatioFit(desiredSize.x, desiredSize.y, maxSize.x, maxSize.y)
    }
    return maxSize
}

export function applyRatio(dimensions: Dimensiony, ratio: number) {
    return {x: dimensions.x * ratio, y: dimensions.y * ratio}
}

export function removeOffset(dimensions: Dimensiony, offsetToRemove: Dimensiony): Dimensiony {
    return {x: dimensions.x - offsetToRemove.x, y: dimensions.y - offsetToRemove.y}
}

export function tuplizeDimensiony(dimensions: Dimensiony) {
    return [dimensions.x, dimensions.y]
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

export const initialize = async () => {
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
}
