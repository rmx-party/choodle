import {PNG} from 'pngjs/browser';

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
