import { CellManager } from "./cellmanager.js";
import { Command } from "./command.js";
import { Painter } from "./paint.js";
import { GridDrawer } from "./griddrawer.js";
import { KeyboardCellSelection } from "./keyboardselection.js";
import { SelectionInputManager } from "./positioninput.js";

export class celleditcommand implements Command {
    private cellmanager: CellManager;
    private row: number;
    private col: number;
    private oldValue: string | number | null;
    private newValue: string | number | null;
    griddrawer: GridDrawer;
    cellInput: HTMLInputElement | null = null;
    keyboardSelection: KeyboardCellSelection | null = null;
    event : KeyboardEvent | PointerEvent ;
    


    constructor(cellmanager: CellManager, row: number, col: number,oldValue: string |number, newValue: string | number | null,griddrawer: GridDrawer,cellInput: HTMLInputElement | null = null,keyboardSelection: KeyboardCellSelection | null = null, event : KeyboardEvent | PointerEvent) {
        this.cellmanager = cellmanager;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.griddrawer = griddrawer;
        this.cellInput = cellInput;
        this.event = event 
        
    }

    execute(): void {
        this.cellmanager.setCell(this.row, this.col, this.newValue);
        this.keyboardSelection?.updateinputvalue();
        this.griddrawer.paintSelectionsAndHeaders(this.event)
        
    }

    undo(): void {
        this.cellmanager.setCell(this.row, this.col, this.oldValue);
        this.keyboardSelection?.updateinputvalue();
        this.griddrawer.paintSelectionsAndHeaders(this.event)
    }

    redo(): void {
        this.execute();
        this.keyboardSelection?.updateinputvalue();
        this.griddrawer.paintSelectionsAndHeaders(this.event)
    }
}