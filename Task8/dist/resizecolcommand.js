export class resizeColCommand {
    constructor(cols, colIndex, newWidth, oldWidth, griddrawer) {
        this.cols = cols;
        this.colIndex = colIndex;
        this.oldWidth = oldWidth;
        console.log(this.oldWidth);
        this.newWidth = newWidth;
        this.griddrawer = griddrawer;
    }
    execute() {
        this.cols.setWidth(this.colIndex, this.newWidth);
        this.griddrawer.paintSelectionsAndHeaders();
    }
    undo() {
        this.cols.setWidth(this.colIndex, this.oldWidth);
        this.griddrawer.paintSelectionsAndHeaders();
    }
    redo() {
        this.execute();
        this.griddrawer.paintSelectionsAndHeaders();
    }
}
