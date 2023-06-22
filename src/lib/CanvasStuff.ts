import {browser} from '$app/environment';
import localforage from 'localforage';
import {UndoStack} from "$lib/UndoStack";
import {goto} from "$app/navigation";

/* Configuration */
const lineWidth = 10;

let isDrawing = false;

export function canShare() {
    if (browser) {
        return navigator.share
    }
    return false
}

export function startDrawing(e: Event) {
    isDrawing = true;
    e.preventDefault()
    console.groupCollapsed('drawing')
}

export function endDrawing(context: CanvasRenderingContext2D) {
    return e => {
        e.preventDefault()
        isDrawing = false;
        context.stroke();
        context.beginPath();
        push()
        console.groupEnd()
    };
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
    canvasContext().fillStyle = 'white';
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
    return document.getElementById('choodle-board')! as HTMLCanvasElement;
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

export const resizeCanvas = (canvas: HTMLCanvasElement) => {
    return e => {
        const ratio = window.devicePixelRatio || 1;

        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
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

function calculateCoordinatesFromEvent(e: MouseEvent | TouchEvent, ratio: number, bounds: DOMRect): [number, number] {
    let newX, newY: number

    const oldX = e.clientX || e.touches[0].clientX
    const oldY = e.clientY || e.touches[0].clientY

    newX = oldX * ratio - bounds.left * ratio;
    newY = oldY * ratio - bounds.top * ratio;

    return [newX, newY];
}

export const initialize = () => {
    if (!browser) return;

    resizeCanvas(canvas())(null)

    const mouseDraw = (context: CanvasRenderingContext2D) => {
        const ratio = window.devicePixelRatio || 1;
        context.lineWidth = lineWidth;
        context.lineCap = 'round';

        return (e: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
            if (!isDrawing) return;

            e.preventDefault()
            context.lineTo(...calculateCoordinatesFromEvent(e, ratio, canvas().getBoundingClientRect()));
            context.stroke();
            console.log(e)
        }
    }

    canvas().addEventListener('mousedown', startDrawing);
    canvas().addEventListener('touchstart', startDrawing);

    canvas().addEventListener('mouseup', endDrawing(canvasContext()));
    canvas().addEventListener('touchend', endDrawing(canvasContext()));

    canvas().addEventListener('mousemove', mouseDraw(canvasContext()));
    canvas().addEventListener('touchmove', mouseDraw(canvasContext()));

    document.addEventListener('click', e => {
        e.preventDefault()
    });

    window.addEventListener('resize', resizeCanvas(canvas()), false);
    window.addEventListener('DOMContentLoaded', resizeCanvas(canvas()), false);

    setTimeout(resizeCanvas(canvas()), 5) // FIXME: this sucks.
    setTimeout(() => load(), 10) // FIXME: me too, even worse

}
