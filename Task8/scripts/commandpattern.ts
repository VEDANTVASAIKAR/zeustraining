import { Command } from './command';

export class Commandpattern {

    /** Stack of executed commands for undo functionality */
    private undostack: Command[] = [];
    /** Stack of undone commands for redo functionality */
    private redostack: Command[] = [];

    execute(cmd: Command) {
        cmd.execute();
        this.undostack.push(cmd);
        this.redostack = [];
        console.log("EXec Undo", this.undostack);
        console.log("Exec Redo", this.redostack);
    }

    /**
     * Undoes the last executed command.
     * If there are no commands to undo, this method does nothing.
     */
    undo() {
        const cmd = this.undostack.pop();
        if (cmd) {
            cmd.undo();
            this.redostack.push(cmd);
        }

        console.log("UndoFn Undo", this.undostack);
        console.log("UndoFn Redo", this.redostack);
    }

    /**
     * Redoes the last undone command.
     * If there are no commands to redo, this method does nothing.
     */
    redo() {
        const cmd = this.redostack.pop();
        if (cmd) {
            cmd.redo();
            this.undostack.push(cmd);
        }

        console.log("RedoFn Undo", this.undostack);
        console.log("RedoFn Redo", this.redostack);
    }

}