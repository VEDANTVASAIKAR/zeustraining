import { getExcelColumnLabel } from "./utils.js";
import { Painter } from "./paint.js";
import { drawVisibleColumnHeaders, drawVisibleRowHeaders } from "./paint.js";
/**
 * GridDrawer class is responsible for all canvas rendering operations
 * It handles drawing the grid, cells, and optimization for large datasets
 */
export class GridDrawer {
    constructor(canvasId, rows, cols, cellmanager) {
        this.selectionManager = null;
        this.selection = null;
        this.selectionarr = [];
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
        this.container.addEventListener('scroll', () => {
            this.canvas.style.transform = `translate(${this.container.scrollLeft}px, ${this.container.scrollTop}px)`;
            this.overlay.style.transform = `translate(${this.container.scrollLeft}px, ${this.container.scrollTop}px)`;
        });
        this.rows = rows;
        this.cols = cols;
        // Listen for selection changes
        window.addEventListener('selection-changed', (event) => {
            this.selection = event.detail.selection;
            this.selectionarr = event.detail.selectionarr || [];
        });
    }
    setSelectionManager(selectionManager) {
        this.selectionManager = selectionManager;
    }
    columnheaders(rows, cols) {
        for (let j = 1; j < cols.n; j++) {
            let label = getExcelColumnLabel(j - 1);
            this.cellmanager.setCell(0, j, label);
        }
    }
    rowheaders(rows, cols) {
        for (let i = 1; i <= rows.n; i++) {
            let label = i;
            this.cellmanager.setCell(i, 0, label);
        }
    }
    /** Modular function: Calculate the visible row/col range */
    getVisibleRange(rows, cols) {
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;
        const viewportWidth = this.container.clientWidth;
        const viewportHeight = this.container.clientHeight;
        let rowSum = 0, startRow = 0;
        while (startRow < rows.n && rowSum < scrollTop)
            rowSum += rows.heights[startRow++];
        startRow = Math.max(0, startRow - 1);
        let endRow = startRow, rowEndSum = rowSum;
        while (endRow < rows.n && rowEndSum < scrollTop + viewportHeight)
            rowEndSum += rows.heights[endRow++];
        endRow = Math.min(rows.n - 1, endRow + 1);
        let colSum = 0, startCol = 0;
        while (startCol < cols.n && colSum < scrollLeft)
            colSum += cols.widths[startCol++];
        startCol = Math.max(0, startCol - 1);
        let endCol = startCol, colEndSum = colSum;
        while (endCol < cols.n && colEndSum < scrollLeft + viewportWidth)
            colEndSum += cols.widths[endCol++];
        endCol = Math.min(cols.n - 1, endCol + 1);
        return { startRow, endRow, startCol, endCol };
    }
    /** Modular function: Draw grid lines for the visible area */
    drawGridLines(startRow, endRow, startCol, endCol, rows, cols) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#e0e0e0";
        let yPos = 0;
        for (let i = 0; i <= endRow; i++) {
            if (i >= startRow) {
                const lineY = yPos - this.container.scrollTop + 0.5;
                this.ctx.moveTo(0, lineY);
                this.ctx.lineTo(this.canvas.width, lineY);
            }
            yPos += rows.heights[i];
        }
        let xPos = 0;
        for (let i = 0; i <= endCol; i++) {
            if (i >= startCol) {
                const lineX = xPos - this.container.scrollLeft + 0.5;
                this.ctx.moveTo(lineX, 0);
                this.ctx.lineTo(lineX, this.canvas.height);
            }
            xPos += cols.widths[i];
        }
        this.ctx.stroke();
    }
    /** Modular function: Draw regular cells */
    drawVisibleCells(startRow, endRow, startCol, endCol, rows, cols) {
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row === 0 || col === 0)
                    continue;
                const cell = this.cellmanager.getCell(row, col);
                const value = cell ? cell.value : null;
                if (cell)
                    this.drawCell(row, col, value, rows, cols);
            }
        }
    }
    /** Modular function: Draw all row headers in visible range */
    drawVisibleRowHeaders(startRow, endRow, rows, cols) {
        for (let row = startRow; row <= endRow; row++) {
            if (row === 0)
                continue;
            this.drawFixedRowHeader(row, rows, cols, this.container.scrollTop);
        }
    }
    /** Modular function: Draw all column headers in visible range */
    drawVisibleColumnHeaders(startCol, endCol, rows, cols) {
        for (let col = startCol; col <= endCol; col++) {
            if (col === 0)
                continue;
            this.drawFixedColumnHeader(col, rows, cols, this.container.scrollLeft);
        }
    }
    /** Modular function: Draw the fixed corner cell */
    drawCorner(rows, cols) {
        this.drawFixedCornerCell(rows, cols);
    }
    /** Modular function: Clear canvas */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    /** Main function: Renders only the visible part of the grid based on current scroll position */
    rendervisible(rows, cols) {
        this.clearCanvas();
        const { startRow, endRow, startCol, endCol } = this.getVisibleRange(rows, cols);
        this.drawGridLines(startRow, endRow, startCol, endCol, rows, cols);
        this.drawVisibleCells(startRow, endRow, startCol, endCol, rows, cols);
        this.drawVisibleRowHeaders(startRow, endRow, rows, cols);
        this.drawVisibleColumnHeaders(startCol, endCol, rows, cols);
        this.drawCorner(rows, cols);
    }
    drawFixedRowHeader(row, rows, cols, scrollTop) {
        let y = 0;
        for (let i = 0; i < row; i++)
            y += rows.heights[i];
        const x = 0, w = cols.widths[0], h = rows.heights[row], drawY = y - scrollTop, drawX = 0;
        if (drawY + h < 0 || drawY > this.canvas.height)
            return;
        this.ctx.clearRect(drawX, drawY, w, h);
        this.ctx.fillStyle = "rgba(245,245,245,0.95)";
        this.ctx.fillRect(drawX, drawY, w, h);
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "right";
        this.ctx.fillText(row.toString(), drawX + w - 8, drawY + h / 2);
    }
    drawFixedColumnHeader(col, rows, cols, scrollLeft) {
        let x = 0;
        for (let i = 0; i < col; i++)
            x += cols.widths[i];
        const y = 0, w = cols.widths[col], h = rows.heights[0], drawX = x - scrollLeft, drawY = 0;
        if (drawX + w < 0 || drawX > this.canvas.width)
            return;
        this.ctx.clearRect(drawX, drawY, w, h);
        this.ctx.fillStyle = "rgba(245,245,245,0.95)";
        this.ctx.fillRect(drawX, drawY, w, h);
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        const label = getExcelColumnLabel(col - 1);
        this.ctx.fillText(label, drawX + w / 2, drawY + h / 2);
    }
    drawFixedCornerCell(rows, cols) {
        const w = cols.widths[0], h = rows.heights[0];
        this.ctx.clearRect(0, 0, w, h);
        this.ctx.fillStyle = "rgba(245,245,245,1)";
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(0.5, 0.5, w, h);
    }
    drawCell(row, col, value, rows, cols) {
        const isHeader = row === 0 || col === 0;
        // O(1) position lookups directly from Rows and Cols
        const x = cols.getPosition(col);
        const y = rows.getPosition(row);
        const w = cols.widths[col], h = rows.heights[row];
        const drawX = x - this.container.scrollLeft, drawY = y - this.container.scrollTop;
        this.ctx.clearRect(drawX, drawY, w, h);
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        this.ctx.fillStyle = 'black';
        let parsedNum = parseFloat(value != null ? value.toString() : "");
        if (!isNaN(parsedNum)) {
            this.ctx.textAlign = "right";
            this.ctx.fillText(value != null ? value.toString() : "", drawX + w - 8, drawY + h / 2);
        }
        else {
            this.ctx.textAlign = "left";
            this.ctx.fillText(value != null ? value.toString() : "", drawX + 8, drawY + h / 2);
        }
    }
    drawPreviewLineOverlay(x) {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        this.overlayCtx.beginPath();
        this.overlayCtx.setLineDash([5, 5]);
        this.overlayCtx.moveTo(x, 0);
        this.overlayCtx.lineTo(x, this.overlay.height);
        this.overlayCtx.strokeStyle = '#107c41';
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
        this.overlayCtx.strokeStyle = '#107c41';
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.stroke();
        this.overlayCtx.setLineDash([]);
    }
    clearOverlay() {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }
    paintSelectionsAndHeaders(ctx = this.ctx, rows = this.rows, cols = this.cols, cellmanager = this.cellmanager, container = this.container, selection = this.selection, selectionarr = this.selectionarr) {
        const { startRow, endRow, startCol, endCol } = this.getVisibleRange(rows, cols);
        // Paint selected cells and overlays
        Painter.paintSelectedCells(ctx, this, rows, cols, cellmanager, container, selection, selectionarr);
        // Paint sticky headers last (on top)
        drawVisibleColumnHeaders(startCol, endCol, rows, cols, container, ctx, selectionarr, selection);
        drawVisibleRowHeaders(startRow, endRow, rows, cols, container, ctx, selectionarr, selection);
    }
}
