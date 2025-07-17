import { Cols } from "./cols.js";
import { Command } from "./command.js";
import { GridDrawer } from "./griddrawer.js";

export class resizeColCommand implements Command {
    private cols: Cols;
    private colIndex: number;
    private oldWidth: number;
    private newWidth: number;
    griddrawer: GridDrawer;
    event : KeyboardEvent | PointerEvent ;

    constructor(cols: Cols, colIndex: number, newWidth: number,oldWidth: number,griddrawer: GridDrawer,event : KeyboardEvent | PointerEvent ) {
        this.cols = cols;
        this.colIndex = colIndex;
        this.oldWidth = oldWidth;
        // console.log(this.oldWidth);
        this.newWidth = newWidth;
        this.griddrawer = griddrawer;
        this.event = event
        
    }

    execute(): void {
        this.cols.setWidth(this.colIndex, this.newWidth);
        this.griddrawer.paintSelectionsAndHeaders(this.event)
    }

    undo(): void {
        this.cols.setWidth(this.colIndex, this.oldWidth);
        this.griddrawer.paintSelectionsAndHeaders(this.event)
    }

    redo(): void {
        this.execute();
        this.griddrawer.paintSelectionsAndHeaders(this.event)
    }
}