export class rowresizeRowcommand {
    constructor(rows, colIndex, newWidth) {
        this.rows = rows;
        this.colIndex = colIndex;
        this.oldWidth = this.rows.getHeight(colIndex);
        this.newWidth = newWidth;
    }
    execute() {
        this.rows.setHeight(this.colIndex, this.newWidth);
    }
    undo() {
        this.rows.setHeight(this.colIndex, this.oldWidth);
    }
    redo() {
        this.execute();
    }
}
