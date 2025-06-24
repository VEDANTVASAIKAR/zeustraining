

/**
 * Represents a single cell in the grid.
 */
export class Cell {
  data: string;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number, data: string = "") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.data = data;
  }

  draw(ctx: CanvasRenderingContext2D, showRightHandle: boolean = false, showBottomHandle: boolean = false): void {
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 0.4;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textBaseline = "middle";
    let ellipse = this.data;
    let i = 0;
    if (ctx.measureText(this.data).width > this.width) {
      ellipse = '';
      while (ctx.measureText(ellipse).width < (this.width - 8) && i < this.data.length) {
        ellipse += this.data[i];
        i++;
      }
    }
    ctx.fillText(ellipse, this.x + this.width/2, this.y + this.height / 2);

    ctx.save();
    if (showRightHandle) {
      ctx.fillStyle = "#1976d2";
      ctx.fillRect(this.x + this.width - 5, this.y + this.height / 2 - 7, 6, 14);
    }
    if (showBottomHandle) {
      ctx.fillStyle = "#388e3c";
      ctx.fillRect(this.x + this.width / 2 - 7, this.y + this.height - 5, 14, 6);
    }
    ctx.restore();
  }

  getResizeEdge(mouseX: number, mouseY: number, tolerance: number = 5): "right" | "bottom" | null {
    if (
      mouseX > this.x + this.width - tolerance &&
      mouseX < this.x + this.width + tolerance &&
      mouseY > this.y && mouseY < this.y + this.height
    ) {
      return "right";
    }
    if (
      mouseY > this.y + this.height - tolerance &&
      mouseY < this.y + this.height + tolerance &&
      mouseX > this.x && mouseX < this.x + this.width
    ) {
      return "bottom";
    }
    return null;
  }
}