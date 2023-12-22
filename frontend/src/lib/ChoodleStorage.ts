import { browser } from "$app/environment";
import { upScaledImageUrlBy } from "$lib/ImageUtils";
import { upScaledImageRatio } from "$lib/Configuration";
import { readWriteClient } from "$lib/CMSUtils";
import type { UndoStack } from "$lib/UndoStack";
import { createDrawing, imagePUT } from "./storage";

const uploadImageBlob = (imageBlob: Blob) => {
  // return readWriteClient.assets.upload("image", imageBlob, { timeout: 5000 });

  return imagePUT({ url: "/drawing/upload", imageBlob });
};

export const createUncommittedChoodle = async (
  { undoStack, canvas, extraMetadata }: {
    undoStack: UndoStack;
    canvas: HTMLCanvasElement;
    extraMetadata?: any;
  },
) => {
  if (!browser) return;

  // const upScaledUploadResult = (async () => {
  //   const upScaledImage = await upScaledImageUrlBy(canvas, upScaledImageRatio);
  //   if (!upScaledImage) return;
  //
  //   const upScaledImageBlob =
  //     await (await fetch(upScaledImage as unknown as URL)).blob();
  //   return await uploadImageBlob(upScaledImageBlob);
  // })();

  const uploadResult = (async () => {
    const imgBlob = await (await fetch(undoStack.current)).blob();
    return await uploadImageBlob(imgBlob);
  })();

  console.log(`pending uploads`, uploadResult);

  const result = await uploadResult;
  if (!result?.url) throw new Error(`failed to upload image`);

  const drawing = await createDrawing({
    ...extraMetadata,
    imageUrl: result.url,
  });

  console.log(`created drawing`, drawing);
  return drawing;
};
