import localforage from "localforage";
import {UndoStack} from "$lib/UndoStack";
import {choodlePromptKey, choodleUndoKey} from "$lib/Configuration";

export async function clearStorage() {
    await localforage.removeItem(choodleUndoKey)
    await localforage.removeItem(choodlePromptKey)
}

export async function setUndoStack(undoStack: UndoStack) {
    await localforage.setItem(choodleUndoKey, undoStack.storable)
}

export async function getUndoStack() {
    return UndoStack.fromStorable(await localforage.getItem(choodleUndoKey));
}
