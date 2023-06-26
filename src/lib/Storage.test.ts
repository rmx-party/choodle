import {describe, expect, it, vi, beforeEach, afterEach} from 'vitest';
import {UndoStack} from "$lib/UndoStack";
import {Storage} from "$lib/Storage";
describe('Storage', () => {
    let undoStack: UndoStack;
    let setItem: any;
    let getItem: any;

    beforeEach(() => {
        undoStack = new UndoStack()
        setItem = vi.fn();
        getItem = vi.fn();
    });

    afterEach(() => {
        setItem.mockReset()
        getItem.mockReset()
    })

    it('saves the stack and cursor', () => {
        const storage = new Storage(undoStack, 'choodle-undo', 'choodle-undo-cursor', setItem, getItem)
        storage.save()

        expect(setItem).toHaveBeenCalledWith('choodle-undo', undoStack.stack)
        expect(setItem).toHaveBeenCalledWith('choodle-undo-cursor', undoStack.cursor)
    });

    it('saves the stack and cursor', () => {
        const setItem = vi.fn()
        const getItem = vi.fn()

        const storage = new Storage(undoStack, 'choodle-undo', 'choodle-undo-cursor', setItem, getItem)
        storage.load()

        expect(getItem).toHaveBeenCalledWith('choodle-undo')
        expect(getItem).toHaveBeenCalledWith('choodle-undo-cursor')
    });
});