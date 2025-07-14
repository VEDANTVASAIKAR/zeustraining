import { CellManager } from "./cellmanager.js";
import { Command } from "./command.js";
import { Painter } from "./paint.js";
import { GridDrawer } from "./griddrawer.js";

export class celleditcommand implements Command {
    private cellmanager: CellManager;
    private row: number;
    private col: number;
    private oldValue: string | number | null;
    private newValue: string | number | null;
    griddrawer: GridDrawer;


    constructor(cellmanager: CellManager, row: number, col: number,oldValue: string |number, newValue: string | number | null,griddrawer: GridDrawer) {
        this.cellmanager = cellmanager;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.griddrawer = griddrawer;
    }

    execute(): void {
        this.cellmanager.setCell(this.row, this.col, this.newValue);
        this.griddrawer.paintSelectionsAndHeaders()
        
    }

    undo(): void {
        this.cellmanager.setCell(this.row, this.col, this.oldValue);
        this.griddrawer.paintSelectionsAndHeaders()
    }

    redo(): void {
        this.execute();
        this.griddrawer.paintSelectionsAndHeaders()
    }
}