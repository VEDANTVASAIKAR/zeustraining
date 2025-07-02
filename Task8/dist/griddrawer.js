import { getExcelColumnLabel } from "./utils.js";
/**
 * GridDrawer class is responsible for all canvas rendering operations
 * It handles drawing the grid, cells, and optimization for large datasets
 */
export class GridDrawer {
    /**
     * Initializes the GridDrawer
     * @param canvasId - ID of the canvas element
     * @param rows - Row manager instance
     * @param cols - Column manager instance
     * @param cellmanager - Cell manager instance
     */
    constructor(canvasId, rows, cols, cellmanager) {
        // Get the main canvas element
        this.canvas = document.getElementById(canvasId);
        // Get the container for scroll position tracking
        this.container = document.querySelector('.container');
        // Get the overlay canvas for temporary visual elements
        this.overlay = document.getElementById('overlay');
        // Get 2D rendering contexts for both canvases
        const ctx = this.canvas.getContext("2d");
        const overlayCtx = this.overlay.getContext("2d");
        // Store the cell manager reference
        this.cellmanager = cellmanager;
        // Ensure we have valid contexts
        if (!ctx || !overlayCtx)
            throw new Error("No 2D context");
        // Store contexts
        this.ctx = ctx;
        this.overlayCtx = overlayCtx;
        // Set canvas dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Attach scroll event to the container, not window
        this.container.addEventListener('scroll', () => {
            this.canvas.style.transform = `translate(${this.container.scrollLeft}px, ${this.container.scrollTop}px)`;
            this.overlay.style.transform = `translate(${this.container.scrollLeft}px, ${this.container.scrollTop}px)`;
        });
        // Store references to row and column managers
        this.rows = rows;
        this.cols = cols;
    }
    /**
     * Draws all column headers (A, B, C, etc.)
     * @param rows - Row manager instance
     * @param cols - Column manager instance
     */
    columnheaders(rows, cols) {
        for (let j = 1; j < cols.n; j++) {
            let label = getExcelColumnLabel(j - 1);
            this.cellmanager.setCell(0, j, label);
            this.drawCell(0, j, label, rows, cols);
        }
    }
    /**
     * Draws all row headers (1, 2, 3, etc.)
     * @param rows - Row manager instance
     * @param cols - Column manager instance
     */
    rowheaders(rows, cols) {
        // Get current scroll position from container
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;
        for (let i = 1; i <= rows.n; i++) {
            let label = i;
            this.cellmanager.setCell(i, 0, label);
            this.drawCell(i, 0, label, rows, cols);
        }
    }
    /**
     * Renders only the visible part of the grid based on current scroll position
     * @param rows - Row manager instance
     * @param cols - Column manager instance
     */
    rendervisible(rows, cols) {
        // Clear the entire canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Get current scroll position from container
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;
        // console.log(`Scroll position: top=${scrollTop}, left=${scrollLeft}`);
        // Get viewport dimensions
        const viewportWidth = this.container.clientWidth;
        const viewportHeight = this.container.clientHeight;
        // Calculate visible range for rows
        let rowSum = 0;
        let startRow = 0;
        // Find the first visible row
        while (startRow < rows.n && rowSum < scrollTop) {
            rowSum += rows.heights[startRow];
            startRow++;
        }
        // Step back one row to ensure we include partially visible rows
        startRow = Math.max(0, startRow - 1);
        // Find the last visible row
        let endRow = startRow;
        let rowEndSum = rowSum;
        while (endRow < rows.n && rowEndSum < scrollTop + viewportHeight) {
            rowEndSum += rows.heights[endRow];
            endRow++;
        }
        // Add one more row as buffer
        endRow = Math.min(rows.n - 1, endRow + 1);
        // Calculate visible range for columns
        let colSum = 0;
        let startCol = 0;
        // Find the first visible column
        while (startCol < cols.n && colSum < scrollLeft) {
            colSum += cols.widths[startCol];
            startCol++;
        }
        // Step back one column to ensure we include partially visible columns
        startCol = Math.max(0, startCol - 1);
        // Find the last visible column
        let endCol = startCol;
        let colEndSum = colSum;
        while (endCol < cols.n && colEndSum < scrollLeft + viewportWidth) {
            colEndSum += cols.widths[endCol];
            endCol++;
        }
        // Add one more column as buffer
        endCol = Math.min(cols.n - 1, endCol + 1);
        // Log the visible range for debugging
        // console.log(`Rendering rows ${startRow} to ${endRow}, columns ${startCol} to ${endCol}`);
        // Draw grid lines for the entire visible area
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#e0e0e0";
        // Draw horizontal lines for visible rows
        let yPos = 0;
        for (let i = 0; i <= endRow; i++) {
            if (i >= startRow) {
                // Draw line at the correct position accounting for scroll
                const lineY = yPos - scrollTop + 0.5;
                this.ctx.moveTo(0, lineY);
                this.ctx.lineTo(this.canvas.width, lineY);
            }
            yPos += rows.heights[i];
        }
        // Draw vertical lines for visible columns
        let xPos = 0;
        for (let i = 0; i <= endCol; i++) {
            if (i >= startCol) {
                // Draw line at the correct position accounting for scroll
                const lineX = xPos - scrollLeft + 0.5;
                this.ctx.moveTo(lineX, 0);
                this.ctx.lineTo(lineX, this.canvas.height);
            }
            xPos += cols.widths[i];
        }
        // Stroke all grid lines at once for better performance
        this.ctx.stroke();
        // --- First pass: Draw regular cells (non-headers) ---
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                // Skip header cells (row 0 or column 0) for now
                if (row === 0 || col === 0)
                    continue;
                // Get the cell or check if it's empty
                const cell = this.cellmanager.getCell(row, col);
                const value = cell ? cell.value : null;
                // Draw only cells that have data
                if (cell) {
                    this.drawCell(row, col, value, rows, cols);
                }
            }
        }
        // --- Second pass: Draw row headers (fixed left) ---
        for (let row = startRow; row <= endRow; row++) {
            if (row === 0)
                continue; // Skip corner cell
            // Calculate position in virtual grid for Y coordinate
            let y = 0;
            for (let i = 0; i < row; i++) {
                y += rows.heights[i];
            }
            const w = cols.widths[0];
            const h = rows.heights[row];
            // Row headers are fixed at left (x=0) but scroll vertically
            const drawX = 0;
            const drawY = y - scrollTop;
            // Skip if completely outside viewport
            if (drawY + h < 0 || drawY > this.canvas.height) {
                continue;
            }
            // Draw header cell
            this.ctx.clearRect(drawX, drawY, w, h);
            this.ctx.fillStyle = "rgba(245,245,245,1)";
            this.ctx.fillRect(drawX, drawY, w, h);
            this.ctx.strokeStyle = "#e0e0e0";
            this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
            // Draw row number
            this.ctx.fillStyle = "#000";
            this.ctx.font = "12px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(String(row), drawX + w / 2, drawY + h / 2);
        }
        // --- Third pass: Draw column headers (fixed top) ---
        for (let col = startCol; col <= endCol; col++) {
            if (col === 0)
                continue; // Skip corner cell
            // Calculate position in virtual grid for X coordinate
            let x = 0;
            for (let i = 0; i < col; i++) {
                x += cols.widths[i];
            }
            const w = cols.widths[col];
            const h = rows.heights[0];
            // Column headers are fixed at top (y=0) but scroll horizontally
            const drawX = x - scrollLeft;
            const drawY = 0;
            // Skip if completely outside viewport
            if (drawX + w < 0 || drawX > this.canvas.width) {
                continue;
            }
            // Draw header cell
            this.ctx.clearRect(drawX, drawY, w, h);
            this.ctx.fillStyle = "rgba(245,245,245,1)";
            this.ctx.fillRect(drawX, drawY, w, h);
            this.ctx.strokeStyle = "#e0e0e0";
            this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
            // Draw column label
            this.ctx.fillStyle = "#000";
            this.ctx.font = "12px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            const label = getExcelColumnLabel(col - 1);
            this.ctx.fillText(label, drawX + w / 2, drawY + h / 2);
        }
        // --- Finally: Draw corner cell (top-left) ---
        const cornerW = cols.widths[0];
        const cornerH = rows.heights[0];
        this.ctx.clearRect(0, 0, cornerW, cornerH);
        this.ctx.fillStyle = "rgba(245,245,245,1)";
        this.ctx.fillRect(0, 0, cornerW, cornerH);
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(0.5, 0.5, cornerW, cornerH);
    }
    /**
     * Draws a row header in a fixed position regardless of horizontal scroll
     */
    drawFixedRowHeader(row, rows, cols, scrollTop) {
        // Calculate position in virtual grid for Y coordinate
        let y = 0;
        for (let i = 0; i < row; i++) {
            y += rows.heights[i];
        }
        // For row headers, X is always 0 (left edge)
        const x = 0;
        // Get dimensions
        const w = cols.widths[0];
        const h = rows.heights[row];
        // Adjust only vertical position for scroll
        const drawY = y - scrollTop;
        const drawX = 0; // Fixed at left edge
        // Skip if completely outside viewport
        if (drawY + h < 0 || drawY > this.canvas.height) {
            return;
        }
        // Clear cell area and draw with header styling
        this.ctx.clearRect(drawX, drawY, w, h);
        // Fill header background
        this.ctx.fillStyle = "rgba(245,245,245,0.95)";
        this.ctx.fillRect(drawX, drawY, w, h);
        // Draw border
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        // Draw text (row number)
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(String(row), drawX + w / 2, drawY + h / 2);
    }
    /**
     * Draws a column header in a fixed position regardless of vertical scroll
     */
    drawFixedColumnHeader(col, rows, cols, scrollLeft) {
        // Calculate position in virtual grid for X coordinate
        let x = 0;
        for (let i = 0; i < col; i++) {
            x += cols.widths[i];
        }
        // For column headers, Y is always 0 (top edge)
        const y = 0;
        // Get dimensions
        const w = cols.widths[col];
        const h = rows.heights[0];
        // Adjust only horizontal position for scroll
        const drawX = x - scrollLeft;
        const drawY = 0; // Fixed at top edge
        // Skip if completely outside viewport
        if (drawX + w < 0 || drawX > this.canvas.width) {
            return;
        }
        // Clear cell area and draw with header styling
        this.ctx.clearRect(drawX, drawY, w, h);
        // Fill header background
        this.ctx.fillStyle = "rgba(245,245,245,0.95)";
        this.ctx.fillRect(drawX, drawY, w, h);
        // Draw border
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        // Draw text (column label)
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        const label = getExcelColumnLabel(col - 1);
        this.ctx.fillText(label, drawX + w / 2, drawY + h / 2);
    }
    /**
     * Draws the corner cell (top-left) that stays fixed regardless of scrolling
     */
    drawFixedCornerCell(rows, cols) {
        const w = cols.widths[0];
        const h = rows.heights[0];
        // Always at the top-left corner (0,0)
        this.ctx.clearRect(0, 0, w, h);
        // Fill background
        this.ctx.fillStyle = "rgba(245,245,245,1)";
        this.ctx.fillRect(0, 0, w, h);
        // Draw border
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(0.5, 0.5, w, h);
    }
    /**
     * Draws a single cell with its value
     * @param row - Row index of the cell
     * @param col - Column index of the cell
     * @param value - Value to display in the cell
     * @param rows - Row manager instance
     * @param cols - Column manager instance
     */
    drawCell(row, col, value, rows, cols) {
        // Determine if this is a header cell
        const isHeader = row === 0 || col === 0;
        // Calculate cell position in virtual space (the entire grid)
        const x = cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
        const y = rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
        const w = cols.widths[col];
        const h = rows.heights[row];
        // Adjust position for current scroll (to display in viewport)
        const drawX = x - this.container.scrollLeft;
        const drawY = y - this.container.scrollTop;
        // Clear the cell area
        this.ctx.clearRect(drawX, drawY, w, h);
        // Draw cell border
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        // Handle header cells differently (with background)
        if (isHeader) {
            // Center text in header cells
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            // Gray background for headers
            this.ctx.fillStyle = "rgba(245,245,245,1)";
            this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w, h);
            // Text styling
            this.ctx.fillStyle = "#000";
            this.ctx.font = "12px Arial";
            // Draw the text centered in the cell
            this.ctx.fillText(value != null ? String(value) : "", drawX + w / 2, drawY + h / 2);
        }
        else {
            // Left-align text in regular cells
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "middle";
            this.ctx.fillStyle = "#000";
            this.ctx.font = "12px Arial";
            // Draw the text with a small padding from the left
            this.ctx.fillText(value != null ? String(value) : "", drawX + 4, drawY + h / 2);
        }
    }
    /**
     * Draws a vertical preview line during column resizing
     * @param x - X-coordinate where to draw the line
     */
    drawPreviewLineOverlay(x) {
        // Clear the overlay canvas
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        // Begin drawing the dashed line
        this.overlayCtx.beginPath();
        this.overlayCtx.setLineDash([5, 5]); // Dashed line pattern
        this.overlayCtx.moveTo(x, 0);
        this.overlayCtx.lineTo(x, this.overlay.height);
        this.overlayCtx.strokeStyle = '#000';
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.stroke();
        this.overlayCtx.setLineDash([]); // Reset dash pattern
    }
    /**
     * Draws a horizontal preview line during row resizing
     * @param y - Y-coordinate where to draw the line
     */
    drawPreviewLineOverlayRow(y) {
        // Clear the overlay canvas
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        // Begin drawing the dashed line
        this.overlayCtx.beginPath();
        this.overlayCtx.setLineDash([5, 5]); // Dashed line pattern
        this.overlayCtx.moveTo(0, y);
        this.overlayCtx.lineTo(this.overlay.width, y);
        this.overlayCtx.strokeStyle = '#000';
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.stroke();
        this.overlayCtx.setLineDash([]); // Reset dash pattern
    }
    /** Clears the overlay canvas */
    clearOverlay() {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }
}
