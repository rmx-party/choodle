import {UndoStack} from "$lib/UndoStack";

export class Storage {
    constructor(private undoStack: UndoStack,
                private undoStackKey: string,
                private cursorKey: string,
                private setItem: (key: string, value: any) => void,
                private getItem: (key:string) => any) {
    }

    save = (): void => {
        this.setItem(this.undoStackKey, this.undoStack.stack)
        this.setItem(this.cursorKey, this.undoStack.cursor)
    }

    load(): UndoStack {
        this.undoStack.stack = this.getItem(this.undoStackKey)
        this.undoStack.cursor = this.getItem(this.cursorKey)

        return this.undoStack;
    }
}
