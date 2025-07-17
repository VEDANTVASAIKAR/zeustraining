import { Rows } from "./rows";
import { Command } from "./command";
import { GridDrawer } from "./griddrawer.js";   

export class resizeRowcommand implements Command {
    private rows: Rows;
    private colIndex: number;
    private oldHeight: number;
    private newHeight: number;
    griddrawer: GridDrawer;
    event : KeyboardEvent | PointerEvent ;

    constructor(rows: Rows, colIndex: number, newHeight: number,oldHeight: number,griddrawer: GridDrawer,event : KeyboardEvent | PointerEvent ) {
        this.rows = rows;
        this.colIndex = colIndex;
        this.oldHeight = oldHeight;
        this.newHeight = newHeight;
        this.griddrawer = griddrawer;
        this.event = event
    }

    execute(): void {
        this.rows.setHeight(this.colIndex, this.newHeight);
        // this.griddrawer.paintSelectionsAndHeaders();
    }

    undo(): void {
        this.rows.setHeight(this.colIndex, this.oldHeight);
        // this.griddrawer.paintSelectionsAndHeaders();

    }

    redo(): void {
        this.execute();
        // this.griddrawer.paintSelectionsAndHeaders();

    }
}