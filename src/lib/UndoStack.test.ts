import {describe, expect, it} from 'vitest';
import {UndoStack} from "$lib/UndoStack";

describe('UndoStack', () => {
    it('a new UndoStack has an empty current', () => {
        const undoStack = new UndoStack()

        expect(undoStack.current).toBe('')
    });

    it('a new populated UndoStack sets current to the last item', () => {
        const undoStack = new UndoStack(['bar', 'baz', 'qux'])

        expect(undoStack.current).toBe('qux')
    });

    it('a new UndoStack which was passed in undefined, gets an empty undo stack', () => {
        const undoStack = new UndoStack(undefined)

        expect(undoStack.current).toBe('')
    });

    it('a new UndoStack which was passed in null, gets an empty undo stack', () => {
        const undoStack = new UndoStack(null)

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
            .push('bar')
            .push('baz')

        expect(undoStack.current).toBe('baz')
    });

    describe('undo', () => {
        it('gives the previous entry when undo is called once', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
                .push('bar')
                .push('baz')

            undoStack.undo()

            expect(undoStack.current).toBe('bar')
        });

        it('gives the correct entry when undo is called twice', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
                .push('bar')
                .push('baz')
                .undo()
                .undo()

            expect(undoStack.current).toBe('foo')
        });

        it('makes current the first item when undoing past the beginning', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
                .undo()
                .undo()

            expect(undoStack.current).toBe('')
        });
    });

    describe('redo', () => {
        it('makes the previous entry current when undoing twice', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
                .push('bar')
                .push('baz')
                .undo()
                .undo()
                .redo()

            expect(undoStack.current).toBe('bar')
        });

        it('makes the last entry current when redoing past the end', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
                .push('bar')
                .push('baz')
                .redo()

            expect(undoStack.current).toBe('baz')
        });

        it('redoes the first when we undo to the beginning of the list', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
                .push('baz')
                .undo()
                .undo()
                .redo()

            expect(undoStack.current).toBe('foo')
        });
    });

    describe('truncate', () => {
        it('truncates the undo stack from current to end', () => {
        });
    });

    describe('push', () => {
        it('when a new item is pushed in the middle of the stack, truncate the stack', () => {
        });
    });

    describe('clear', () => {
        it('empties the stack', () => {
            const undoStack = new UndoStack()

            undoStack.push('foo')
                .push('bar')
                .push('baz')
                .clear()

            expect(undoStack.current).toBe('')
        });
    });

    describe('cursor', () => {
        it('sets the cursor', () => {
            const undoStack = new UndoStack(['foo', 'bar', 'baz'])

            undoStack.cursor = 1

            expect(undoStack.current).toBe('bar')
        });
    });

    describe('last', () => {
        it('sets the cursor to the end and returns current', () => {
            const undoStack = new UndoStack(['foo', 'bar', 'baz'])
            undoStack.cursor = 1

            undoStack.last

            expect(undoStack.current).toBe('baz')
        });
    });
});
