import { Line } from "./line.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { CellManager } from "./cellmanager.js";
import { getExcelColumnLabel } from "./utils.js";


export class GridDrawer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  cellmanager: CellManager;
  container: HTMLElement;
  rows: Rows; // <--- add this line
  cols: Cols; // <--- add this line

  /**
   * @param canvasId - The ID of the canvas element
   */
  constructor(canvasId: string, rows: Rows, cols: Cols, cellmanager: CellManager) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.container = document.querySelector('.container') as HTMLElement;
    const ctx = this.canvas.getContext("2d");
    this.cellmanager = cellmanager;
    if (!ctx) throw new Error("No 2D context");
    this.ctx = ctx;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.rows = rows; // <--- add this line
    this.cols = cols; // <--- add this line
  }

  drawRows(rows: Rows, cols: Cols) {
    for (let i = 0; i <= rows.n; i++) {
      const y = i * CELL_HEIGHT;
      const line = new Line(0, y + 0.5, cols.n * CELL_WIDTH, y+0.5);
      line.draw(this.ctx);
    }
  }
  drawCols(rows: Rows, cols: Cols) {
    
    for (let i = 0; i <= cols.n; i++) {
      const x = i * CELL_WIDTH;
      const line = new Line(x +0.5, 0, x+0.5, rows.n * CELL_HEIGHT);
      line.draw(this.ctx);
    }
  }

  rendervisible(rows: Rows, cols: Cols) {



      // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // 1. Find the first visible row
      let sum = 0;
      let startRow = 0;
      while (startRow < rows.n && sum + rows.heights[startRow] <= this.container.scrollTop) {
          sum += rows.heights[startRow];
          startRow++;
      }

      // 2. Find the last visible row (one past the last)
      sum = 0;
      let endRow = 0;
      const visibleBottom = this.container.scrollTop + this.container.clientHeight;
      while (endRow < rows.n && sum < visibleBottom) {
          sum += rows.heights[endRow];
          endRow++;
      }

      // 3. Find the first visible column
      sum = 0;
      let startCol = 0;
      while (startCol < cols.n && sum + cols.widths[startCol] <= this.container.scrollLeft) {
          sum += cols.widths[startCol];
          startCol++;
      }

      // 4. Find the last visible column (one past the last)
      sum = 0;
      let endCol = 0;
      const visibleRight = this.container.scrollLeft + this.container.clientWidth;
      while (endCol < cols.n && sum < visibleRight) {
          sum += cols.widths[endCol];
          endCol++;
      }

      // // 5. Now loop through just these cells and draw them!
      // for (let row = startRow; row < endRow; row++) {
      //     for (let col = startCol; col < endCol; col++) {
      //         const cell = this.cellmanager.getCell(row, col);
      //         const value = cell ? cell.value : '';
      //         this.drawCell(row, col, value, rows, cols);
      //     }
      // }
      // for (let i = startRow; i <= endRow; i++) {
      //   const y = i * CELL_HEIGHT;
      //   const line = new Line(0, y + 0.5, cols.n * CELL_WIDTH, y+0.5);
      //   line.draw(this.ctx);
      // }
      // for (let i = startCol; i <= endCol; i++) {
      //   const x = i * CELL_WIDTH;
      //   const line = new Line(x +0.5, 0, x+0.5, rows.n * CELL_HEIGHT);
      //   line.draw(this.ctx);
      // }

  }

  columnheaders(rows: Rows, cols: Cols){
    for (let j=0;j< cols.n; j++){
      let label = getExcelColumnLabel(j)
      this.cellmanager.setCell(0,j,label)
      this.drawCell(0,j,label,rows,cols,true)
    }     
  }

  rowheaders(rows:Rows,cols:Cols){
    for(let i=1;i<= rows.n;i++){
      let label = i;
      this.cellmanager.setCell(i,0,label);
      this.drawCell(i,0,label,rows,cols,true)
    }
  }

/**
 * Draws a single cell value, preserving the grid borders by only clearing/painting inside the borders.
 * This prevents overlapping text and keeps grid lines sharp even after edits or redraws.
 * @param {number} row The row index of the cell
 * @param {number} col The column index of the cell
 * @param {string|number|null} value The value to draw in the cell
 * @param {Rows} rows The Rows manager (for calculating cell heights)
 * @param {Cols} cols The Cols manager (for calculating cell widths)
 */
drawCell(
    row: number,
    col: number,
    value: string | number | null,
    rows: Rows,
    cols: Cols,
    isheader : boolean = false
  ) {
    // Virtual grid position in the giant sheet
    const x = cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
    const y = rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
    const w = cols.widths[col];
    const h = rows.heights[row];

    // OFFSET by scroll position!
    const drawX = x - this.container.scrollLeft;
    const drawY = y - this.container.scrollTop;

    // Only clear the inside area of the cell, leaving a 1px margin for grid borders
    this.ctx.clearRect(drawX + 1, drawY + 1, w - 2, h - 2);

    // Draw the borders again to keep the grid sharp
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);

    // Draw the cell value
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";
    if(isheader){
      this.ctx.textBaseline = "top";
      this.ctx.fillText(
        value != null ? String(value) : "",
        drawX + w/2,
        drawY + h / 2
      );
    }else{
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        value != null ? String(value) : "",
        drawX + 4,
        drawY + h/2
      );
    }
  }
  /**
 * Draws a vertical preview line for column resizing
 * @param x The x coordinate where to draw the line
 */
drawPreviewLine(x: number) {
      // First clear any existing preview line
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Redraw the grid (without resizing yet)
      this.drawRows(this.rows, this.cols);
      this.drawCols(this.rows, this.cols);
      this.columnheaders(this.rows, this.cols);
      this.rowheaders(this.rows, this.cols);
      
      // Draw the dashed preview line
      this.ctx.beginPath();
      this.ctx.setLineDash([5, 5]); // Create dashed line effect
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.strokeStyle = '#000';
      this.ctx.stroke();
      this.ctx.setLineDash([]); // Reset line style
  }
  /**
  /**
   * Draws the entire grid: cells, headers, and grid lines.
   * This should be the only function you call to fully redraw after changes.
   */
  drawGrid(rows: Rows, cols: Cols) {
      // 1. Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // 2. Draw all cells (skip headers in row 0 and col 0)
      for (let row = 1; row < rows.n; row++) {
          for (let col = 1; col < cols.n; col++) {
              const cell = this.cellmanager.getCell(row, col);
              const value = cell ? cell.value : '';
              this.drawCell(row, col, value, rows, cols, false);
          }
      }

      // 3. Draw column headers and row headers
      this.columnheaders(rows, cols);
      this.rowheaders(rows, cols);

      // 4. Draw grid lines
      this.drawRows(rows, cols);
      this.drawCols(rows, cols);
  }

}