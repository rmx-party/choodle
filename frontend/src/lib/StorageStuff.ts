import localforage from "localforage";
import {UndoStack} from "$lib/UndoStack";
import {crunchCanvas} from "$lib/ImageUtils";
import {canvas, drawImageFromDataURL} from "$lib/CanvasStuff";

const choodleUndoKey = 'choodle-undo'

export function clearStorage() {
    localforage.keys().then((keys) => {
        keys.map(async (key) => {
            await localforage.removeItem(key)
        })
    })
}

export const load = async () => {
    const undoStack = await getUndoStack()

    drawImageFromDataURL(undoStack.last, canvas().getContext('2d')!);
    console.log(`loaded`, undoStack)
}

export async function setUndoStack(undoStack: UndoStack) {
    await localforage.setItem(choodleUndoKey, undoStack.storable)
}

export async function getUndoStack() {
    return UndoStack.fromStorable(await localforage.getItem(choodleUndoKey));
}

export async function push() {
    const undoStack = await getUndoStack()

    const imageDataUrl = await crunchCanvas(canvas(), canvas().getContext('2d')!)
    undoStack.push(imageDataUrl)

    await setUndoStack(undoStack);
}
