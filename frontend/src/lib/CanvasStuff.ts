import {backgroundColour, pixelRatio} from "$lib/Configuration";

export function clearCanvas(id: string) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
}

export function drawImageFromDataURL(dataURL: string, context: CanvasRenderingContext2D) {
    const image = new Image;
    clearCanvas('choodle-board') // FIXME: this should not be hard-coded
    image.addEventListener('load', () => {
        context.drawImage(image, 0, 0);
        context.stroke();
    });
    image.src = dataURL;
}
