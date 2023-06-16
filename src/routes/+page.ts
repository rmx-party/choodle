import {browser} from '$app/environment';
import localforage from 'localforage';

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

const save = () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    localforage.setItem("choodle", canvas.toDataURL())
}

const load = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
    const dataURL = await localforage.getItem("choodle").catch((e) => {
    })

    clear()

    if (dataURL) {
        const image = new Image;
        image.addEventListener('load', () => {
            canvas.getContext('2d')!.drawImage(image, 0, 0);
        });
        image.src = dataURL;
    }
}

const push = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    const undoStack: [] = await localforage.getItem('choodle-undo') || []
    undoStack.push(canvas.toDataURL())
    localforage.setItem(`choodle-undo`, undoStack)
}

const pop = async () => {
    const undoStack: [] = await localforage.getItem('choodle-undo') || []
    await localforage.setItem('choodle-undo', undoStack.slice(0, -1))
}

const undo = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    await pop()

    const undoStack: [] = await localforage.getItem('choodle-undo') || []

    const dataURL = undoStack[undoStack.length - 1]

    if (dataURL) {
        clearDisplay()

        const image = new Image;
        image.addEventListener('load', () => {
            canvas.getContext('2d')!.drawImage(image, 0, 0);
        });
        image.src = dataURL;
    }
}

const resizeCanvas = (canvas: HTMLCanvasElement) => {
    return e => {
        const ratio   = window.devicePixelRatio || 1;

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
        const ratio   = window.devicePixelRatio || 1;
        context.lineWidth = lineWidth;
        context.lineCap = 'round';

        return (e: MouseEvent | TouchEvent | PointerEvent | DragEvent) => {
            e.preventDefault()
            console.log(`drawing`, e)
            const bounds = canvas.getBoundingClientRect();

            if (!isDrawing) {
                return;
            }

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
        } else if (e.target.id === 'save-board') {
            save()
        } else if (e.target.id === 'load-board') {
            load()
        } else if (e.target.id === 'undo') {
            undo()
        } else if (e.target.id === 'log-storage') {
            localforage.getItem('choodle-undo').then(item => {
                console.log(item)
            })
        }
    });

    window.addEventListener('resize', resizeCanvas(canvas), false);
    window.addEventListener('DOMContentLoaded', resizeCanvas(canvas), false);

    setTimeout(resizeCanvas(canvas), 5) // FIXME: this sucks.
}
