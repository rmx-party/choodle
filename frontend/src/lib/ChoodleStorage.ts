import {browser} from "$app/environment";
import {upScaledImageUrlBy} from "$lib/ImageUtils";
import {upScaledImageRatio} from "$lib/Configuration";
import {readWriteClient} from "$lib/CMSUtils";
import type {UndoStack} from "$lib/UndoStack";
import {getDeviceId, locateCreator} from "$lib/CreatorUtils";

const uploadImageBlob = (imageBlob: Blob) => {
  return readWriteClient.assets.upload('image', imageBlob, {timeout: 5000})
}

export const addChoodleToCreator = async ({choodleId, creatorId}) => {
  const result = await readWriteClient
    .patch(creatorId)
    .setIfMissing({choodles: []})
    .append('choodles', [{_ref: choodleId}])
    .commit({
      autoGenerateArrayKeys: true,
    })
  console.log('addChoodleToCreator', {choodleId, creatorId, result})
  return result
}

export async function saveChoodle(undoStack: UndoStack, canvas: HTMLCanvasElement, extraMetadata?: any) {
  if (!browser) return;

  const upScaledUploadResult = (async () => {
    const upScaledImage = await upScaledImageUrlBy(canvas, upScaledImageRatio)
    if (!upScaledImage) return;

    const upScaledImageBlob = await (await fetch(upScaledImage as unknown as
      URL)).blob()
    return await uploadImageBlob(upScaledImageBlob)
  })()

  const uploadResult = (async () => {
    const imgBlob = await (await fetch(undoStack.current)).blob();
    return await uploadImageBlob(imgBlob)
  })()

  console.log(`pending uploads`, uploadResult, upScaledUploadResult)

  let choodleId = `choodle-${window.crypto.randomUUID()}`;
  const cmsChoodle = {
    _id: choodleId,
    _type: 'choodle',
    title: 'Untitled',
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: (await uploadResult)?._id,
      }
    },
    upScaledImage: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: (await upScaledUploadResult)?._id,
      }
    },
    shouldMint: true,
    ...extraMetadata
  }
  console.log({cmsChoodle})
  const createResult = readWriteClient.create(cmsChoodle)
  console.log({createResult})

  const deviceId = await getDeviceId()
  const creator = await locateCreator({deviceId})
  addChoodleToCreator({choodleId: choodleId, creatorId: creator._id})

  return createResult;
}
