import {browser} from '$app/environment';
import localforage from 'localforage';
import {UndoStack} from "$lib/UndoStack";

/* Configuration */
const lineWidth = 5;

let isDrawing = false;

function startDrawing(e: Event) {
    isDrawing = true;
    e.preventDefault()
}

function endDrawing(context: CanvasRenderingContext2D) {
    return e => {
        e.preventDefault()
        isDrawing = false;
        context.stroke();
        context.beginPath();
        push()
    };
}

function clearStorage() {
    localforage.keys().then((keys) => {
        keys.map((key) => {
            localforage.removeItem(key)
        })
    })
}

function clearDisplay() {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
}

const clear = () => {
    clearDisplay();
    clearStorage();
}

function drawImageFromDataURL(dataURL: string, canvas: HTMLCanvasElement) {
    const image = new Image;
    image.addEventListener('load', () => {
        canvas.getContext('2d')!.drawImage(image, 0, 0);
        canvas.getContext('2d')!.stroke();
        console.log('image loaded', image)
    });
    image.src = dataURL;
}

const load = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))

    drawImageFromDataURL(undoStack.last, canvas);
    console.log(`loaded`, undoStack)
}

const push = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))
    undoStack.cursor = await localforage.getItem('choodle-undo-cursor') || 0

    undoStack.push(canvas.toDataURL())

    await localforage.setItem('choodle-undo', undoStack.stack)
    await localforage.setItem('choodle-undo-cursor', undoStack.cursor)
}

const undo = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))
    undoStack.cursor = await localforage.getItem('choodle-undo-cursor') || 0
    undoStack.undo()

    await localforage.setItem('choodle-undo-cursor', undoStack.cursor)

    const dataURL = undoStack.current

    clearDisplay()

    drawImageFromDataURL(dataURL, canvas)
}

const redo = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    const undoStack = new UndoStack(await localforage.getItem('choodle-undo'))
    undoStack.cursor = await localforage.getItem('choodle-undo-cursor') || 0
    undoStack.redo()

    await localforage.setItem('choodle-undo-cursor', undoStack.cursor)

    clearDisplay()
    drawImageFromDataURL(undoStack.current, canvas)
}

const resizeCanvas = (canvas: HTMLCanvasElement) => {
    return e => {
        const ratio = window.devicePixelRatio || 1;

        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
    }
}


if (browser) {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;

    resizeCanvas(canvas)(null)

    const mouseDraw = (context: CanvasRenderingContext2D) => {
        const ratio = window.devicePixelRatio || 1;
        context.lineWidth = lineWidth;
        context.lineCap = 'round';

        return (e: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
            if (!isDrawing) return;

            e.preventDefault()
            const bounds = canvas.getBoundingClientRect();

            console.log(`drawing`, e)

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
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing);

    canvas.addEventListener('mouseup', endDrawing(context));
    canvas.addEventListener('touchend', endDrawing(context));

    canvas.addEventListener('mousemove', mouseDraw(context));
    canvas.addEventListener('touchmove', mouseDraw(context));

    document.addEventListener('click', e => {
        if (e.target.id === 'clear-board') {
            clear()
        } else if (e.target.id === 'undo') {
            undo()
        } else if (e.target.id === 'redo') {
            redo()
        }
    });

    window.addEventListener('resize', resizeCanvas(canvas), false);
    window.addEventListener('DOMContentLoaded', resizeCanvas(canvas), false);


    setTimeout(resizeCanvas(canvas), 5) // FIXME: this sucks.
    setTimeout(() => load(), 10) // FIXME: me too, even worse
}
