import { Rows } from "./rows";
import { Command } from "./command";

export class rowresizeRowcommand implements Command {
    private rows: Rows;
    private colIndex: number;
    private oldWidth: number;
    private newWidth: number;

    constructor(rows: Rows, colIndex: number, newWidth: number) {
        this.rows = rows;
        this.colIndex = colIndex;
        this.oldWidth = this.rows.getHeight(colIndex);
        this.newWidth = newWidth;
    }

    execute(): void {
        this.rows.setHeight(this.colIndex, this.newWidth);
    }

    undo(): void {
        this.rows.setHeight(this.colIndex, this.oldWidth);
    }

    redo(): void {
        this.execute();
    }
}