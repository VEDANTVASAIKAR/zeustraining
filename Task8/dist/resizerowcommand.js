export class resizeRowcommand {
    constructor(rows, colIndex, newHeight, oldHeight, griddrawer) {
        this.rows = rows;
        this.colIndex = colIndex;
        this.oldHeight = oldHeight;
        this.newHeight = newHeight;
        this.griddrawer = griddrawer;
    }
    execute() {
        this.rows.setHeight(this.colIndex, this.newHeight);
        this.griddrawer.paintSelectionsAndHeaders();
    }
    undo() {
        this.rows.setHeight(this.colIndex, this.oldHeight);
        this.griddrawer.paintSelectionsAndHeaders();
    }
    redo() {
        this.execute();
        this.griddrawer.paintSelectionsAndHeaders();
    }
}
