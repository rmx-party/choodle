import {browser} from '$app/environment';
import localforage from 'localforage';
import {UndoStack} from "$lib/UndoStack";
import {goto} from "$app/navigation";

/* Configuration */
const lineWidth = 5;

let isDrawing = false;

export function canShare() : boolean {
    if (browser) return !!navigator.share
    return false
}

/* Drawing */
export function startDrawing(e: MouseEvent | TouchEvent) {
    const ratio = window.devicePixelRatio || 1;

    isDrawing = true;
    e.preventDefault()
    console.groupCollapsed('drawing')
    const [newX, newY] = calculateCoordinatesFromEvent(e, canvas().getBoundingClientRect())

    canvasContext().beginPath()
    canvasContext().ellipse(newX, newY, lineWidth / 2, lineWidth / 2, 0, 0, 360)
    canvasContext().fillStyle = "black";
    canvasContext().fill()
    canvasContext().closePath()
    canvasContext().beginPath()
}

const doDraw = (context: CanvasRenderingContext2D) => {
    return (e: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
        if (!isDrawing) return;

        e.preventDefault()
        drawTo(...calculateCoordinatesFromEvent(e, canvas().getBoundingClientRect()));
        console.log(e)
    }
}

export function endDrawing(context: CanvasRenderingContext2D) {
    return e => {
        e.preventDefault()
        isDrawing = false;
        context.closePath()
        push()
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
        keys.map((key) => {
            localforage.removeItem(key)
        })
    })
}

export function clearDisplay() {
    canvasContext().clearRect(0, 0, canvas().width, canvas().height);
    canvasContext().fillStyle = "#fafafa";
    canvasContext().fillRect(0, 0, canvas().width, canvas().height);
}

export const clear = (e) => {
    e.preventDefault()

    clearDisplay();
    clearStorage();
}

export function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
    const image = new Image;
    clearDisplay()
    image.addEventListener('load', () => {
        context.drawImage(image, 0, 0);
        context.stroke();
        console.log('image loaded', image)
    });
    image.src = dataURL;
}

export const load = async () => {
    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))

    drawImageFromDataURL(undoStack.last, canvasContext());
    console.log(`loaded`, undoStack)
}

export function canvas() {
    let instance = null;
    instance ||= document.getElementById('choodle-board')! as HTMLCanvasElement;
    return instance
}

export function canvasContext() {
    return canvas().getContext('2d')!
}

export const push = async () => {
    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))
    undoStack.cursor = await localforage.getItem('choodle-undo-cursor') || 0

    undoStack.push(canvas().toDataURL())

    await localforage.setItem('choodle-undo', undoStack.stack)
    await localforage.setItem('choodle-undo-cursor', undoStack.cursor)
}

export const undo = async (e) => {
    e.preventDefault()

    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))
    undoStack.cursor = await localforage.getItem('choodle-undo-cursor') || 0
    undoStack.undo()

    await localforage.setItem('choodle-undo-cursor', undoStack.cursor)

    const dataURL = undoStack.current

    drawImageFromDataURL(dataURL, canvasContext())
}

export const redo = async (e) => {
    e.preventDefault()

    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))
    undoStack.cursor = await localforage.getItem('choodle-undo-cursor') || 0
    undoStack.redo()

    await localforage.setItem('choodle-undo-cursor', undoStack.cursor)

    drawImageFromDataURL(undoStack.current, canvasContext())
}

export const resizeCanvas = () => {
    return e => {
        const ratio = window.devicePixelRatio || 1;

        const rootElement = document.querySelector("html") as HTMLElement
        const windowHeight = rootElement.clientHeight
        const windowWidth = rootElement.clientWidth

        const buttonsElement = document.getElementById('buttons')!
        const buttonsHeight = buttonsElement.clientHeight

        canvas().width = windowWidth * ratio;
        canvas().height = (windowHeight - buttonsHeight) * ratio;
        load()
    }
}

export const mint = (e) => {
    e.preventDefault()

    // FIXME: only if not logged in
    goto('/login')
}

export const share = async (e: Event) => {
    e.preventDefault()

    const imgBlob = await (await fetch(canvas().toDataURL("image/png", 1.0))).blob();
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

function calculateCoordinatesFromEvent(e: MouseEvent | TouchEvent, bounds: DOMRect): [number, number] {
    const ratio = window.devicePixelRatio || 1;
    let newX, newY: number

    const oldX = e.clientX || e.touches[0].clientX
    const oldY = e.clientY || e.touches[0].clientY

    newX = oldX * ratio - bounds.left * ratio;
    newY = oldY * ratio - bounds.top * ratio;

    return [newX, newY];
}

export const initialize = () => {
    if (!browser) return;

    resizeCanvas()(null)

    canvas().addEventListener('mousedown', startDrawing);
    canvas().addEventListener('touchstart', startDrawing);

    canvas().addEventListener('mouseup', endDrawing(canvasContext()));
    canvas().addEventListener('touchend', endDrawing(canvasContext()));

    canvas().addEventListener('mousemove', doDraw(canvasContext()));
    canvas().addEventListener('touchmove', doDraw(canvasContext()));

    document.addEventListener('click', e => {
        e.preventDefault()
    });

    window.addEventListener('resize', resizeCanvas(), false);
    window.addEventListener('DOMContentLoaded', resizeCanvas(), false);

    setTimeout(resizeCanvas(), 5) // FIXME: this sucks.
    setTimeout(() => load(), 10) // FIXME: me too, even worse

}
