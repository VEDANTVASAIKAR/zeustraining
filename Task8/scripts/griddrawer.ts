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
    this.canvas.height = rows.n* CELL_HEIGHT
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
}