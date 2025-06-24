export class GridRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }
    draw(model, hoveredResizeRow, hoveredResizeCol, hoveredResizeEdge) {
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
