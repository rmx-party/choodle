import localforage from "localforage";
import { UndoStack } from "$lib/UndoStack";
import { choodlePromptKey, choodleUndoKey } from "$lib/Configuration";

// TODO: wrap undostack in a reactive store so that pages can subscribe to it rather than having to manually refresh it
// TODO: make sure to monitor storage events to keep undo stack in sync across tabs

export async function clearStorage() {
  await localforage.removeItem(choodleUndoKey);
  await localforage.removeItem(choodlePromptKey);
}

export async function setUndoStack(undoStack: UndoStack) {
  await localforage.setItem(choodleUndoKey, undoStack.storable);
}

export async function getUndoStack() {
  return UndoStack.fromStorable(await localforage.getItem(choodleUndoKey));
}
