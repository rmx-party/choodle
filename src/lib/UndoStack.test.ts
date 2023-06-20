import {describe, expect, it} from 'vitest';

class UndoStack {
    private readonly stack: [] | [string]

    constructor() {
        this.stack = []
    }
    get current(): string {
        if (this.stack.length === 0) {
            return ''
        }
        return this.stack[this.stack.length - 1]
    }

    public push = (item: string) => {
        this.stack.push(item)
    }
}

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

    describe('undo', () => {});
    describe('redo', () => {});
    describe('truncate', () => {});
});
