import { GridModel } from "./gridmodel.js";

export class GridRenderer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  draw(model: GridModel, hoveredResizeRow: number, hoveredResizeCol: number, hoveredResizeEdge: "right" | "bottom" | null): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let row = 0; row < model.rows; row++) {
      for (let col = 0; col < model.cols; col++) {
        const showRight = hoveredResizeRow === row && hoveredResizeCol === col && hoveredResizeEdge === "right";
        const showBottom = hoveredResizeRow === row && hoveredResizeCol === col && hoveredResizeEdge === "bottom";
        model.cells[row][col].draw(this.ctx);
      }
    }
    // Optionally show selection (not implemented here)
    
  }
}