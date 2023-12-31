import { PNG } from 'pngjs/browser';
import { blackWhiteThreshold } from '$lib/Configuration';
import { browser } from '$app/environment';

export const applyCrunchToCanvas = async (canvas, ctx) => {
  const buffer = await crunchCanvasToBuffer(canvas, ctx);
  const blackWhiteData = new Uint8ClampedArray(...buffer);

  if (blackWhiteData.length % 4 === 0) {
    const imgData = new ImageData(blackWhiteData, canvas.width);
    ctx.putImageData(imgData, 0, 0);
  }
};

export const crunchCanvasToBuffer = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const png = await new PNG({
    width: imageData.width,
    height: imageData.height,
    filterType: -1, // no filtering
    colorType: 0,
    deflateLevel: 9,
    bitDepth: 8,
    bgColor: { red: 255, green: 255, blue: 255 },
  });

  const [redCoefficient, greenCoefficient, blueCoefficient] = [0.299, 0.587, 0.114];
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;

      // Optimize the PNG by reducing color space to black and white
      let grayscale =
        redCoefficient * imageData.data[idx] +
        greenCoefficient * imageData.data[idx + 1] +
        blueCoefficient * imageData.data[idx + 2];
      grayscale = grayscale > blackWhiteThreshold ? 255 : 0; // threshold, could be adjusted

      png.data[idx] = grayscale; // red
      png.data[idx + 1] = grayscale; // green
      png.data[idx + 2] = grayscale; // blue
      png.data[idx + 3] = imageData.data[idx + 3]; // alpha
    }
  }

  const imageDataSize = imageData.data.length;
  const buffer = PNG.sync.write(await png.pack());

  // console.table([{
  //     action: 'crunch to buffer',
  //     imageDataSize,
  //     crunchedSize: buffer.length,
  //     compression: `${100 - ((buffer.length / imageDataSize) * 100).toFixed(2)}%`
  // }]);
  return buffer;
};

export const crunchCanvasToUrl = async (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
) => {
  const buffer = await crunchCanvasToBuffer(canvas, ctx);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const dataUrlResult = `data:image/png;base64,${base64}`;

  const bufferSize = buffer.length;
  const dataUrlSize = dataUrlResult.length;
  // console.table([{
  //     action: 'crunch to url',
  //     bufferSize,
  //     dataUrlSize,
  //     compression: `${(100 - ((dataUrlSize / buffer.length) * 100)).toFixed(2)}%`
  // }]);

  return dataUrlResult;
};

export const readBlob = (b): Promise<string> => {
  // FIXME: I think this can be replaced with URL.createObjectURL
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result);
    };

    reader.readAsDataURL(b);
  });
};

export const upScaledImageUrlBy = async (canvas: HTMLCanvasElement, scale: number) => {
  if (!browser) return;
  try {
    // OffScreenCanvas is not supported well in all browsers, namely older versions of safari
    const image = await createImageBitmap(canvas, 0, 0, canvas.width, canvas.height, {
      resizeWidth: canvas.width * scale,
      resizeHeight: canvas.height * scale,
      resizeQuality: 'pixelated',
    });
    // ctx.drawImage(image, 0, 0) // TODO: ensure this is correct, explain if needed

    const offScreenCanvas = new OffscreenCanvas(canvas.width * scale, canvas.height * scale);
    const offScreenContext = offScreenCanvas.getContext('2d')!;
    offScreenContext.drawImage(image, 0, 0);

    return await crunchCanvasToUrl(offScreenCanvas, offScreenContext);
  } catch {
    return null;
  }
};
