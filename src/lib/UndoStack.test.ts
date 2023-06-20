import {describe, expect, it} from 'vitest';
import {UndoStack} from "$lib/UndoStack";

describe('UndoStack', () => {
    it('a new UndoStack has an empty current', () => {
        const undoStack = new UndoStack()

        expect(undoStack.current).toBe('')
    });

    it('current is the only item item when there is one item on the stack', () => {
        const undoStack = new UndoStack()

        undoStack.push('foo')

        expect(undoStack.current).toBe('foo')
    });

    it('current is the last added item when there are multiple items on the stack', () => {
        const undoStack = new UndoStack()

        undoStack.push('foo')
        undoStack.push('bar')
        undoStack.push('baz')

        expect(undoStack.current).toBe('baz')
    });

    describe('undo', () => {
        it('gives the previous entry when undo is called once', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
            undoStack.push('bar')
            undoStack.push('baz')

            undoStack.undo()

            expect(undoStack.current).toBe('bar')
        });

        it('gives the correct entry when undo is called twice', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
            undoStack.push('bar')
            undoStack.push('baz')

            undoStack.undo()
            undoStack.undo()

            expect(undoStack.current).toBe('foo')
        });

        it('makes current the first item when undoing past the beginning', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')

            undoStack.undo()
            undoStack.undo()

            expect(undoStack.current).toBe('')
        });
    });

    describe('redo', () => {
        it('makes the previous entry current when undoing twice', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
            undoStack.push('bar')
            undoStack.push('baz')

            undoStack.undo()
            undoStack.undo()
            undoStack.redo()

            expect(undoStack.current).toBe('bar')
        });

        it('makes the last entry current when redoing past the end', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
            undoStack.push('bar')
            undoStack.push('baz')

            undoStack.redo()

            expect(undoStack.current).toBe('baz')
        });
    });

    describe('truncate', () => {
        it('truncates the undostack from current to end', () => {});
    });

    describe('push', () => {
        it('when a new item is pushed in the middle of the stack, truncate the stack', () => {});
    });

    describe('clear', () => {
        it('empties the stack', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
            undoStack.push('bar')
            undoStack.push('baz')

            undoStack.clear()

            expect(undoStack.current).toBe('')
        });
    });

    describe('storage', () => {
        // pass in the storage to the constructor
    });
});
