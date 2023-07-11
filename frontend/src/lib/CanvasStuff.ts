import {browser} from '$app/environment';
import localforage from 'localforage';
import {UndoStack} from "$lib/UndoStack";
import {crunchCanvas} from "$lib/ImageUtils";

/* Configuration */
const lineWidth = 5;
const targetMaxSize: Dimensiony = {x: 430, y: 932}

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
    const [newX, newY] = calculateCoordinatesFromEvent(event)

    canvasContext().beginPath()
    drawTo(newX + 1, newY + 1)
    canvasContext().closePath()
}

const doDraw = (event: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
    if (!isDrawing) return;

    event.preventDefault()
    drawTo(...calculateCoordinatesFromEvent(event));
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

type Dimensiony = {
    x: number;
    y: number;
}

export function maximumSize(desiredSize: Dimensiony, maxSize: Dimensiony): Dimensiony {
    return {
        x: Math.min(desiredSize.x, maxSize.x),
        y: Math.min(desiredSize.y, maxSize.y)
    }
}

export const resizeCanvas = async (_event?: Event) => {
    const ratio = pixelRatio()

    const rootElement = document.querySelector("html") as HTMLElement
    const windowHeight = rootElement.clientHeight
    const windowWidth = rootElement.clientWidth

    const bounds = canvas().getBoundingClientRect();

    const canvasDimensions = maximumSize({x: windowWidth, y: windowHeight}, targetMaxSize)
    canvas().width = (canvasDimensions.x - bounds.x) * ratio;
    canvas().height = (canvasDimensions.y - bounds.y) * ratio;
    await load()
}

function oldCoordsFromEvent(event: MouseEvent | TouchEvent): [number, number] {
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

function calculateCoordinatesFromEvent(event: MouseEvent | TouchEvent): [number, number] {
    const bounds = canvas().getBoundingClientRect();
    const ratio = pixelRatio()
    const [oldX, oldY] = [...oldCoordsFromEvent(event)]
    const newX = (oldX * ratio) - (bounds.left * ratio);
    const newY = (oldY * ratio) - (bounds.top * ratio);

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
