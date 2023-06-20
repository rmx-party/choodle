export class UndoStack {
    private stack: [] | [string]
    private cursor: number

    constructor(initialStack = ['']) {
        this.stack = initialStack
        this.cursor = this.stack.length - 1
    }

    get current(): string {
        return this.stack[this.cursor]
    }

    public push = (item: string): UndoStack => {
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
}
