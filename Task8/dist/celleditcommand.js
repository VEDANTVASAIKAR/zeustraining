export class celleditcommand {
    constructor(cellmanager, row, col, oldValue, newValue, griddrawer, cellInput = null, keyboardSelection = null, event) {
        this.cellInput = null;
        this.keyboardSelection = null;
        this.cellmanager = cellmanager;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.griddrawer = griddrawer;
        this.cellInput = cellInput;
        this.event = event;
    }
    execute() {
        this.cellmanager.setCell(this.row, this.col, this.newValue);
        this.keyboardSelection?.updateinputvalue();
        this.griddrawer.paintSelectionsAndHeaders(this.event);
    }
    undo() {
        this.cellmanager.setCell(this.row, this.col, this.oldValue);
        this.keyboardSelection?.updateinputvalue();
        this.griddrawer.paintSelectionsAndHeaders(this.event);
    }
    redo() {
        this.execute();
        this.keyboardSelection?.updateinputvalue();
        this.griddrawer.paintSelectionsAndHeaders(this.event);
    }
}
