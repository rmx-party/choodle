import {browser} from "$app/environment";
import {upScaledImageUrlBy} from "$lib/ImageUtils";
import {upScaledImageRatio} from "$lib/Configuration";
import {readWriteClient} from "$lib/CMSUtils";
import type {UndoStack} from "$lib/UndoStack";

const uploadImageBlob = (imageBlob: Blob) => {
    return readWriteClient.assets.upload('image', imageBlob, {timeout: 5000})
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

    const cmsChoodle = {
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
    const createResult = await readWriteClient.create(cmsChoodle)
    console.log({createResult})

    return createResult;
}
