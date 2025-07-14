import { Cols } from "./cols.js";
import { Command } from "./command.js";
import { GridDrawer } from "./griddrawer.js";

export class resizeColCommand implements Command {
    private cols: Cols;
    private colIndex: number;
    private oldWidth: number;
    private newWidth: number;
    griddrawer: GridDrawer;

    constructor(cols: Cols, colIndex: number, newWidth: number,oldWidth: number,griddrawer: GridDrawer) {
        this.cols = cols;
        this.colIndex = colIndex;
        this.oldWidth = oldWidth;
        console.log(this.oldWidth);
        this.newWidth = newWidth;
        this.griddrawer = griddrawer;
    }

    execute(): void {
        this.cols.setWidth(this.colIndex, this.newWidth);
        this.griddrawer.paintSelectionsAndHeaders()
    }

    undo(): void {
        this.cols.setWidth(this.colIndex, this.oldWidth);
        this.griddrawer.paintSelectionsAndHeaders()
    }

    redo(): void {
        this.execute();
        this.griddrawer.paintSelectionsAndHeaders()
    }
}