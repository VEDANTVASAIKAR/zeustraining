import { Line } from "./line.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { getExcelColumnLabel } from "./utils.js";
export class GridDrawer {
    /**
     * @param canvasId - The ID of the canvas element
     */
    constructor(canvasId, rows, cols, cellmanager) {
        this.canvas = document.getElementById(canvasId);
        const ctx = this.canvas.getContext("2d");
        this.cellmanager = cellmanager;
        if (!ctx)
            throw new Error("No 2D context");
        this.ctx = ctx;
        // this.canvas.width = cols.n* CELL_WIDTH
        this.canvas.width = window.innerWidth;
        // this.canvas.height = rows.n* CELL_HEIGHT
        this.canvas.height = window.innerHeight;
    }
    drawRows(rows, cols) {
        for (let i = 0; i <= rows.n; i++) {
            const y = i * CELL_HEIGHT;
            const line = new Line(0, y + 0.5, cols.n * CELL_WIDTH, y + 0.5);
            line.draw(this.ctx);
        }
    }
    drawCols(rows, cols) {
        for (let i = 0; i <= cols.n; i++) {
            const x = i * CELL_WIDTH;
            const line = new Line(x + 0.5, 0, x + 0.5, rows.n * CELL_HEIGHT);
            line.draw(this.ctx);
        }
    }
    columnheaders(rows, cols) {
        for (let j = 0; j < cols.n; j++) {
            let label = getExcelColumnLabel(j);
            this.cellmanager.setCell(0, j, label);
            this.drawCell(0, j, label, rows, cols, true);
        }
    }
    rowheaders(rows, cols) {
        for (let i = 1; i <= rows.n; i++) {
            let label = i;
            this.cellmanager.setCell(i, 0, label);
            this.drawCell(i, 0, label, rows, cols, true);
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
    drawCell(row, col, value, rows, cols, isheader = false) {
        // Calculate the top-left x and y position of the cell
        const x = cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
        const y = rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
        const w = cols.widths[col];
        const h = rows.heights[row];
        // Only clear the inside area of the cell, leaving a 1px margin for grid borders
        // This prevents erasing the existing grid lines
        this.ctx.clearRect(x + 1, y + 1, w - 2, h - 2);
        // Draw the borders again to keep the grid sharp (in case they were erased by previous clear)
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(x + 0.5, y + 0.5, w, h);
        // Draw the cell value text, aligned left with a small padding and vertically centered
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "left";
        if (isheader) {
            this.ctx.textBaseline = "top";
            this.ctx.fillText(value != null ? String(value) : "", x + w / 2, // 4px padding from left border
            y + h / 2 // vertical center of the cell
            );
        }
        else {
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(value != null ? String(value) : "", x + 4, // 4px padding from left border
            y + h / 2 // vertical alignment
            );
        }
    }
}
