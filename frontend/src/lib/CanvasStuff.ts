import {browser} from '$app/environment';
import localforage from 'localforage';
import {UndoStack} from "$lib/UndoStack";
import {goto} from "$app/navigation";

/* Configuration */
const lineWidth = 5;

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
    const [newX, newY] = calculateCoordinatesFromEvent(event, canvas().getBoundingClientRect())

    canvasContext().beginPath()
    canvasContext().fillStyle = "black";
    canvasContext().fill()
    drawTo(newX + 0.1, newY + 0.1)
    canvasContext().closePath()
}

const doDraw = (event: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
    if (!isDrawing) return;

    event.preventDefault()
    drawTo(...calculateCoordinatesFromEvent(event, canvas().getBoundingClientRect()));
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

    console.log(`drawing a line to ${x} ${y}`)

    context.strokeStyle = 'black'
    context.lineWidth = lineWidth;
    context.lineCap = 'round';

    context.lineTo(x, y)
    context.stroke();
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
    canvasContext().fillStyle = "#fafafa";
    canvasContext().fillRect(0, 0, canvas().width, canvas().height);
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

export function pixelRatio(): number {
    return 0.25
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

export const push = async () => {
    const undoStack = await getUndoStack()

    undoStack.push(canvas().toDataURL())

    await setUndoStack(undoStack);
}

export const resizeCanvas = async (_event?: Event) => {
    const ratio = pixelRatio()

    const rootElement = document.querySelector("html") as HTMLElement
    const windowHeight = rootElement.clientHeight
    const windowWidth = rootElement.clientWidth

    let buttonsHeight = 0;
    const buttonsElement = document.getElementById('buttons')
    if (buttonsElement) {
        buttonsHeight = buttonsElement.clientHeight;
    }

    canvas().width = windowWidth * ratio;
    canvas().height = (windowHeight - buttonsHeight) * ratio;
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

function calculateCoordinatesFromEvent(event: MouseEvent | TouchEvent, bounds: DOMRect): [number, number] {
    const ratio = pixelRatio()
    const [oldX, oldY] = [...oldCoordsFromEvent(event)]
    const newX = oldX * ratio - bounds.left * ratio;
    const newY = oldY * ratio - bounds.top * ratio;

    return [newX, newY];
}

export const initialize = async () => {
    if (!browser) return;

    await resizeCanvas()

    canvas().addEventListener('mousedown', startDrawing);
    canvas().addEventListener('touchstart', startDrawing);

    canvas().addEventListener('mouseup', endDrawing(canvasContext()));
    canvas().addEventListener('touchend', endDrawing(canvasContext()));

    canvas().addEventListener('mousemove', doDraw);
    canvas().addEventListener('touchmove', doDraw);

    document.addEventListener('click', event => {
        event.preventDefault()
    });
    document.addEventListener('drag', event => {
        event.preventDefault()
    });

    window.addEventListener('resize', resizeCanvas, false);
    window.addEventListener('DOMContentLoaded', resizeCanvas, false);

    setTimeout(resizeCanvas, 5) // FIXME: this sucks.
    setTimeout(() => load(), 10) // FIXME: me too, even worse
}
