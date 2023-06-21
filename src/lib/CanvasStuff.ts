import {browser} from '$app/environment';
import localforage from 'localforage';
import {UndoStack} from "$lib/UndoStack";
import {goto} from "$app/navigation";

/* Configuration */
const lineWidth = 5;

let isDrawing = false;

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

export const download = (e) => {
    e.preventDefault()

    const image = canvas().toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    link.download = "choodle.png";
    link.href = image;
    link.click();
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
            const bounds = canvas().getBoundingClientRect();


            let newX, newY: number;
            if (e.clientX) {
                newX = e.clientX * ratio - bounds.left * ratio;
                newY = e.clientY * ratio - bounds.top * ratio;
            } else {
                newX = e.touches[0].clientX * ratio - bounds.left * ratio;
                newY = e.touches[0].clientY * ratio - bounds.top * ratio;
            }
            context.lineTo(newX, newY);
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