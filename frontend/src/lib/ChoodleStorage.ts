import { browser } from "$app/environment";
import { upScaledImageUrlBy } from "$lib/ImageUtils";
import { upScaledImageRatio } from "$lib/Configuration";
import { readWriteClient } from "$lib/CMSUtils";
import type { UndoStack } from "$lib/UndoStack";
import { createDrawing } from "./storage";

const uploadImageBlob = (imageBlob: Blob) => {
  return readWriteClient.assets.upload("image", imageBlob, { timeout: 5000 });
};

export const createUncommittedChoodle = async (
  { undoStack, canvas, extraMetadata }: {
    undoStack: UndoStack;
    canvas: HTMLCanvasElement;
    extraMetadata?: any;
  },
) => {
  if (!browser) return;

  const upScaledUploadResult = (async () => {
    const upScaledImage = await upScaledImageUrlBy(canvas, upScaledImageRatio);
    if (!upScaledImage) return;

    const upScaledImageBlob =
      await (await fetch(upScaledImage as unknown as URL)).blob();
    return await uploadImageBlob(upScaledImageBlob);
  })();

  const uploadResult = (async () => {
    const imgBlob = await (await fetch(undoStack.current)).blob();
    return await uploadImageBlob(imgBlob);
  })();

  console.log(`pending uploads`, uploadResult, upScaledUploadResult);

  const drawing = await createDrawing({
    ...extraMetadata,
    imageUrl: (await uploadResult).url,
  });

  console.log(`created drawing`, drawing);
  return drawing;
};
