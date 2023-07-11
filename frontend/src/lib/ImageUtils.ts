import {PNG} from 'pngjs/browser';
import {browser} from '$app/environment';

// FIXME: use pngjs to load the image, set some options, and create a new image

export const shrinkImage = async (dataURI: string) => {
    const options = {
        colorType: 0,
        inputHasAlpha: true,
        deflateChunkSize: 256,
        filterType: 0,
    };

    // const ab = await fetch(dataURI).then((response) => response.arrayBuffer())
    const ab = await (await fetch(dataURI)).arrayBuffer()
    console.log(ab.byteLength)

    const png = await new PNG(options).parse(ab)
    console.log(png.byteLength)

    return png
}

export const crunchCanvas = async (canvas, ctx) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const png = await new PNG({
        width: imageData.width,
        height: imageData.height,
        filterType: -1, // no filtering
        bgColor: { red: 255, green: 255, blue: 255}
    });

    const [threshold, redCoefficient, greenCoefficient, blueCoefficient] = [
        128,
        0.299,
        0.587,
        0.114
    ]
    for (let y = 0; y < png.height; y++) {
        for (let x = 0; x < png.width; x++) {
            const idx = (png.width * y + x) << 2;

            // Optimize the PNG by reducing color space to black and white
            let grayscale = redCoefficient*imageData.data[idx] + greenCoefficient*imageData.data[idx+1] + blueCoefficient*imageData.data[idx+2];
            grayscale = (grayscale > threshold) ? 255 : 0; // threshold, could be adjusted

            png.data[idx] = grayscale;   // red
            png.data[idx+1] = grayscale; // green
            png.data[idx+2] = grayscale; // blue
            png.data[idx+3] = imageData.data[idx+3]; // alpha
        }
    }

    const buffer = PNG.sync.write(await png.pack());
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const dataUrlResult = `data:image/png;base64,${base64}`;

    const bufferSize = buffer.length;
    const dataUrlSize = dataUrlResult.length;
    const imageDataSize = imageData.data.length;
    console.log(`crunched: `, { canvas, ctx, imageData, imageDataSize, png, buffer, bufferSize, dataUrlResult, dataUrlSize });

    return dataUrlResult;
}
