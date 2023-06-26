export class UndoStack {
    public stack: [] | string[]
    public cursor: number

    constructor(initialStack: string[] | undefined | null = ['']) {
        this.stack = initialStack || ['']
        this.cursor = this.stack.length - 1
    }

    get current(): string {
        return this.stack[this.cursor]
    }

    get storable(): { cursor: number, stack: string[] } {
        return { cursor: this.cursor, stack: this.stack }
    }

    public push = (item: string): UndoStack => {
        this.stack = this.stack.slice(0, this.cursor + 1)
        this.stack.push(item)
        this.cursor += 1

        return this
    }

    public undo = (): UndoStack => {
        if (this.cursor !== 0) {
            this.cursor -= 1
        }

        return this
    }

    public clear(): UndoStack {
        this.stack = ['']
        this.cursor = 0

        return this
    }

    public redo(): UndoStack {
        if (this.cursor < this.stack.length - 1) {
            this.cursor += 1
        }

        return this
    }

    get last() {
        this.cursor = this.stack.length - 1
        return this.current
    }

    static fromStorable(storable: { cursor: number; stack: string[] } | null) {
        if (!storable) return new UndoStack()

        const undoStack = new UndoStack(storable.stack)
        undoStack.cursor = storable.cursor
        return undoStack
    }
}
