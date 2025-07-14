import { CellManager } from "./cellmanager.js";
import { Command } from "./command.js";

export class celleditcommand implements Command {
    private cellmanager: CellManager;
    private row: number;
    private col: number;
    private oldValue: string | number | null;
    private newValue: string | number | null;

    constructor(cellmanager: CellManager, row: number, col: number,oldValue: string |number, newValue: string | number | null) {
        this.cellmanager = cellmanager;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    execute(): void {
        this.cellmanager.setCell(this.row, this.col, this.newValue);
    }

    undo(): void {
        this.cellmanager.setCell(this.row, this.col, this.oldValue);
    }

    redo(): void {
        this.execute();
    }
}