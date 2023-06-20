export class UndoStack {
    private stack: [] | [string]
    private cursor: number

    constructor() {
        this.stack = ['']
        this.cursor = 0
    }

    get current(): string {
        return this.stack[this.cursor]
    }

    public push = (item: string) => {
        this.stack.push(item)
        this.cursor += 1
    }

    public undo = () => {
        if (this.cursor !== 0) {
            this.cursor -= 1
        }
    }

    public clear() {
        this.stack = ['']
        this.cursor = 0
    }

    public redo() {
        if (this.cursor < this.stack.length - 1) {
            this.cursor += 1
        }
    }
}
