export class Commandpattern {
    constructor(selectionimputmanager) {
        /** Stack of executed commands for undo functionality */
        this.undostack = [];
        /** Stack of undone commands for redo functionality */
        this.redostack = [];
        this.keyboardSelection = null;
        this.selectioninputmanager = null;
        this.selectioninputmanager = selectionimputmanager;
    }
    execute(cmd) {
        cmd.execute();
        this.undostack.push(cmd);
        this.redostack = [];
        this.selectioninputmanager?.positionInputOnSelection();
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
        this.selectioninputmanager?.positionInputOnSelection();
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
        this.selectioninputmanager?.positionInputOnSelection();
    }
}
