import { Line } from "./line.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";

/**
 * Responsible for drawing grid lines (rows and columns) on a canvas.
 * Uses separate classes for Row, Column, and Line.
 */
export class GridDrawer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  /**
   * @param canvasId - The ID of the canvas element
   */
  constructor(canvasId: string , rows: Rows, cols: Cols) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    this.ctx = ctx;
    this.canvas.width = cols.n* CELL_WIDTH
    // this.canvas.width = window.innerWidth
    this.canvas.height = rows.n* CELL_HEIGHT
    // this.canvas.height = window.innerHeight
  }

  drawRows(rows: Rows, cols: Cols) {
    for (let i = 0; i <= rows.n; i++) {
      const y = i * CELL_HEIGHT;
      const line = new Line(0, y, cols.n * CELL_WIDTH, y);
      line.draw(this.ctx);
    }
  }
  drawCols(rows: Rows, cols: Cols) {
    for (let i = 0; i <= cols.n; i++) {
      const x = i * CELL_WIDTH;
      const line = new Line(x, 0, x, rows.n * CELL_HEIGHT);
      line.draw(this.ctx);
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
    cols: Cols
  ) {
    // Calculate the top-left x and y position of the cell
    const x = cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
    const y = rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
    const w = cols.widths[col];
    const h = rows.heights[row];

    // Only clear the inside area of the cell, leaving a 1px margin for grid borders
    // This prevents erasing the existing grid lines
    this.ctx.clearRect(x + 1, y + 1, w - 2, h - 2);

    // Draw the borders again to keep the grid sharp (in case they were erased by previous clear)
    this.ctx.strokeStyle = "#ccc";
    this.ctx.strokeRect(x, y, w, h);

    // Draw the cell value text, aligned left with a small padding and vertically centered
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      value != null ? String(value) : "",
      x + 4,         // 4px padding from left border
      y + h / 2      // vertical center of the cell
    );
  }
}