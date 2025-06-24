import { Cell } from "./cell.js";
export class GridModel {
    constructor(rows = 50, cols = 20, cellWidth = 100, cellHeight = 30) {
        this.selectedRow = 0;
        this.selectedCol = 0;
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.cells = [];
        this.initCells();
    }
    initCells() {
        for (let row = 0; row < this.rows; row++) {
            const curr = [];
            for (let col = 0; col < this.cols; col++) {
                curr.push(new Cell(col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight));
            }
            this.cells.push(curr);
        }
    }
    getCell(row, col) {
        return this.cells[row][col];
    }
}
