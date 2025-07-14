export class celleditcommand {
    constructor(cellmanager, row, col, oldValue, newValue, griddrawer) {
        this.cellmanager = cellmanager;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.griddrawer = griddrawer;
    }
    execute() {
        this.cellmanager.setCell(this.row, this.col, this.newValue);
        this.griddrawer.paintSelectionsAndHeaders();
    }
    undo() {
        this.cellmanager.setCell(this.row, this.col, this.oldValue);
        this.griddrawer.paintSelectionsAndHeaders();
    }
    redo() {
        this.execute();
        this.griddrawer.paintSelectionsAndHeaders();
    }
}
