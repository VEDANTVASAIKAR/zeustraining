export class resizeColCommand {
    constructor(cols, colIndex, newWidth, oldWidth, griddrawer, event) {
        this.cols = cols;
        this.colIndex = colIndex;
        this.oldWidth = oldWidth;
        // console.log(this.oldWidth);
        this.newWidth = newWidth;
        this.griddrawer = griddrawer;
        this.event = event;
    }
    execute() {
        this.cols.setWidth(this.colIndex, this.newWidth);
        this.griddrawer.paintSelectionsAndHeaders(this.event);
    }
    undo() {
        this.cols.setWidth(this.colIndex, this.oldWidth);
        this.griddrawer.paintSelectionsAndHeaders(this.event);
    }
    redo() {
        this.execute();
        this.griddrawer.paintSelectionsAndHeaders(this.event);
    }
}
