export class celleditcommand {
    constructor(cellmanager, row, col, oldValue, newValue) {
        this.cellmanager = cellmanager;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    execute() {
        this.cellmanager.setCell(this.row, this.col, this.newValue);
    }
    undo() {
        this.cellmanager.setCell(this.row, this.col, this.oldValue);
    }
    redo() {
        this.execute();
    }
}
