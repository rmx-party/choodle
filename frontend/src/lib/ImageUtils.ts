import {PNG} from 'pngjs/browser';
import {blackWhiteThreshold} from "$lib/Configuration";

export const applyCrunchToCanvas = async (canvas, ctx) => {
    const buffer = await crunchCanvasToBuffer(canvas, ctx)
    const blackWhiteData = new Uint8ClampedArray(...buffer)

    if (blackWhiteData.length % 4 === 0) {
        const imgData = new ImageData(blackWhiteData, canvas.width)
        ctx.putImageData(imgData, 0, 0)
    }
}

export const crunchCanvasToBuffer = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const png = await new PNG({
        width: imageData.width,
        height: imageData.height,
        filterType: -1, // no filtering
        colorTYpe: 0,
        bgColor: {red: 255, green: 255, blue: 255}
    });

    const [redCoefficient, greenCoefficient, blueCoefficient] = [
        0.299,
        0.587,
        0.114
    ]
    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            const idx = (png.width * y + x) << 2;

            // Optimize the PNG by reducing color space to black and white
            let grayscale = redCoefficient * imageData.data[idx] + greenCoefficient * imageData.data[idx + 1] + blueCoefficient * imageData.data[idx + 2];
            grayscale = (grayscale > blackWhiteThreshold) ? 255 : 0; // threshold, could be adjusted

            png.data[idx] = grayscale;   // red
            png.data[idx + 1] = grayscale; // green
            png.data[idx + 2] = grayscale; // blue
            png.data[idx + 3] = imageData.data[idx + 3]; // alpha
        }
    }

    const imageDataSize = imageData.data.length;
    console.log(`crunched canvas: `, {
        canvas,
        ctx,
        imageData,
        imageDataSize,
        png,
    });

    return PNG.sync.write(await png.pack());
}

export const crunchCanvasToUrl = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const buffer = await crunchCanvasToBuffer(canvas, ctx);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const dataUrlResult = `data:image/png;base64,${base64}`;

    const bufferSize = buffer.length;
    const dataUrlSize = dataUrlResult.length;
    console.log(`crunched to url: `, {
        buffer,
        bufferSize,
        dataUrlResult,
        dataUrlSize
    });

    return dataUrlResult;
}
