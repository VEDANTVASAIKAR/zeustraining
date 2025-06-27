import { Line } from "./line.js";
import { getExcelColumnLabel } from "./utils.js";
export class GridDrawer {
    /**
     * @param canvasId - The ID of the canvas element
     */
    constructor(canvasId, rows, cols, cellmanager) {
        this.canvas = document.getElementById(canvasId);
        this.container = document.querySelector('.container');
        this.overlay = document.getElementById('overlay');
        const ctx = this.canvas.getContext("2d");
        const overlayCtx = this.overlay.getContext("2d");
        this.cellmanager = cellmanager;
        if (!ctx || !overlayCtx)
            throw new Error("No 2D context");
        this.ctx = ctx;
        this.overlayCtx = overlayCtx;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.rows = rows; // <--- add this line
        this.cols = cols; // <--- add this line
    }
    drawRows(rows, cols) {
        let y = 0;
        for (let i = 0; i <= rows.n; i++) {
            // Draw horizontal line at the top of each row
            const line = new Line(0, y + 0.5, cols.widths.reduce((a, b) => a + b, 0), y + 0.5);
            line.draw(this.ctx);
            if (i < rows.n) {
                y += rows.heights[i];
            }
        }
    }
    drawCols(rows, cols) {
        let x = 0;
        for (let i = 0; i <= cols.n; i++) {
            // Draw vertical line at the left of each column
            const line = new Line(x + 0.5, 0, x + 0.5, rows.heights.reduce((a, b) => a + b, 0));
            line.draw(this.ctx);
            if (i < cols.n) {
                x += cols.widths[i];
            }
        }
    }
    columnheaders(rows, cols) {
        for (let j = 1; j < cols.n; j++) {
            let label = getExcelColumnLabel(j - 1);
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
    rendervisible(rows, cols) {
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
        // Virtual grid position in the giant sheet
        const x = cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
        const y = rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
        const w = cols.widths[col];
        const h = rows.heights[row];
        // OFFSET by scroll position!
        const drawX = x - this.container.scrollLeft;
        const drawY = y - this.container.scrollTop;
        // Only clear the inside area of the cell, leaving a 1px margin for grid borders
        // this.ctx.clearRect(drawX + 1, drawY + 1, w - 2, h - 2);
        this.ctx.clearRect(drawX, drawY, w, h);
        // Draw the borders again to keep the grid sharp
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        // Draw the cell value
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "left";
        if (isheader) {
            this.ctx.textBaseline = "top";
            this.ctx.fillText(value != null ? String(value) : "", drawX + w / 2, drawY + h / 2);
        }
        else {
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(value != null ? String(value) : "", drawX + 4, drawY + h / 2);
        }
    }
    drawPreviewLineOverlay(x) {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        this.overlayCtx.beginPath();
        this.overlayCtx.setLineDash([5, 5]);
        this.overlayCtx.moveTo(x, 0);
        this.overlayCtx.lineTo(x, this.overlay.height);
        this.overlayCtx.strokeStyle = '#000';
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.stroke();
        this.overlayCtx.setLineDash([]);
    }
    drawPreviewLineOverlayRow(y) {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        this.overlayCtx.beginPath();
        this.overlayCtx.setLineDash([5, 5]);
        this.overlayCtx.moveTo(0, y);
        this.overlayCtx.lineTo(this.overlay.width, y);
        this.overlayCtx.strokeStyle = '#000';
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.stroke();
        this.overlayCtx.setLineDash([]);
    }
    /** Clears the overlay canvas */
    clearOverlay() {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }
}
