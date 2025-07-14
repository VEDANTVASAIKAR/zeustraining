import { Cols } from "./cols.js";
import { Command } from "./command.js";

export class resizeColCommand implements Command {
    private cols: Cols;
    private colIndex: number;
    private oldWidth: number;
    private newWidth: number;

    constructor(cols: Cols, colIndex: number, newWidth: number) {
        this.cols = cols;
        this.colIndex = colIndex;
        this.oldWidth = this.cols.getWidth(colIndex);
        this.newWidth = newWidth;
    }

    execute(): void {
        this.cols.setWidth(this.colIndex, this.newWidth);
    }

    undo(): void {
        this.cols.setWidth(this.colIndex, this.oldWidth);
    }

    redo(): void {
        this.execute();
    }
}