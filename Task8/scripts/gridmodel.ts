import { Cell } from "./cell.js";

export class GridModel {
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  cells: Cell[][];
  selectedRow: number = 0;
  selectedCol: number = 0;

  constructor(rows: number = 50, cols: number = 20, cellWidth: number = 100, cellHeight: number = 30) {
    this.rows = rows;
    this.cols = cols;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.cells = [];
    this.initCells();
  }

  private initCells() {
    for (let row = 0; row < this.rows; row++) {
      const curr: Cell[] = [];
      for (let col = 0; col < this.cols; col++) {
        curr.push(new Cell(col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight));
      }
      this.cells.push(curr);
    }
  }

  getCell(row: number, col: number): Cell {
    return this.cells[row][col];
  }
}