export class resizeColCommand {
    constructor(cols, colIndex, newWidth) {
        this.cols = cols;
        this.colIndex = colIndex;
        this.oldWidth = this.cols.getWidth(colIndex);
        this.newWidth = newWidth;
    }
    execute() {
        this.cols.setWidth(this.colIndex, this.newWidth);
    }
    undo() {
        this.cols.setWidth(this.colIndex, this.oldWidth);
    }
    redo() {
        this.execute();
    }
}
