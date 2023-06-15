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
        var image = new Image;
        image.addEventListener('load', () => {
            canvas.getContext('2d')!.drawImage(image, 0, 0);
        });
        image.src = dataURL;
    }
}

const push = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    let undoStack: [] = await localforage.getItem('choodle-undo') || []
    undoStack.push(canvas.toDataURL())
    localforage.setItem(`choodle-undo`, undoStack)
}

const pop = async () => {
    let undoStack: [string] = await localforage.getItem('choodle-undo') || []
    localforage.setItem('choodle-undo', undoStack.slice(0, -1))
}

const undo = async () => {
    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;

    await pop()

    let undoStack: [] = await localforage.getItem('choodle-undo') || []

    let dataURL = undoStack[undoStack.length - 1]

    if (dataURL) {
        clearDisplay()

        var image = new Image;
        image.addEventListener('load', () => {
            canvas.getContext('2d')!.drawImage(image, 0, 0);
        });
        image.src = dataURL;
    }
}

const resizeCanvas = (canvas: HTMLCanvasElement) => {
    return e => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
    }
}


if (browser) {
    document.documentElement.style.overflow = 'hidden';

    const canvas: HTMLCanvasElement = document.getElementById('choodle-board')! as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;

    const canvasOffsetX = canvas.offsetLeft;
    const canvasOffsetY = canvas.offsetTop;

    canvas.width = window.innerWidth - canvasOffsetX;
    canvas.height = window.innerHeight - canvasOffsetY;

    const mouseDraw = (e: MouseEvent) => {
        e.preventDefault()
        if (!isDrawing) {
            return;
        }

        context.lineWidth = lineWidth;
        context.lineCap = 'round';

        context.lineTo(e.clientX - canvasOffsetX, e.clientY);
        context.stroke();
    }

    const touchDraw = (e: TouchEvent) => {
        e.preventDefault()
        if (!isDrawing) {
            return;
        }

        context.lineWidth = lineWidth;
        context.lineCap = 'round';

        context.lineTo(e.touches[0].clientX - canvasOffsetX, e.touches[0].clientY);
        context.stroke();
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing);

    canvas.addEventListener('mouseup', endDrawing(context));
    canvas.addEventListener('touchend', endDrawing(context));

    canvas.addEventListener('mousemove', mouseDraw);
    canvas.addEventListener('touchmove', touchDraw);

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
}

if (browser) {
    resizeCanvas(document.getElementById('choodle-board') as HTMLCanvasElement)
}
