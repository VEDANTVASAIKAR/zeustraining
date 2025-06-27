import { findIndexFromCoord } from "./utils.js";
/**
 * Manages all event listeners for the grid and input elements.
 */
export class EventManager {
    constructor(canvas, cellInput, rows, cols, grid, cellManager) {
        this.canvas = canvas;
        this.cellInput = cellInput;
        this.rows = rows;
        this.cols = cols;
        this.grid = grid;
        this.cellManager = cellManager;
        this.selectedRow = null;
        this.selectedCol = null;
        /** @type {number | null} The index of the column border currently hovered for resizing */
        this.hoveredColBorder = null;
        /** @type {number | null} The index of the row border currently hovered for resizing */
        this.hoveredRowBorder = null;
        // Add in EventManager class
        this.resizingCol = null; // Which column is being resized
        this.resizingRow = null;
        this.startX = 0; // Where the drag started (for calculations)
        this.startWidth = 0; // Initial width of the column
        this.startY = 0;
        this.startHeight = 0;
        this.previewLineY = null;
        /** Position of the preview line when resizing */
        this.previewLineX = null;
        this.resizingColLeft = null;
        this.container = document.querySelector('.container');
        this.attachCanvasEvents();
        this.attachInputEvents();
        this.redraw();
        this.attachMouseEvents();
    }
    redraw() {
        this.container.addEventListener('scroll', () => {
            console.log("Scroll event fired!"); // Add this line
            this.grid.rendervisible(this.rows, this.cols);
        });
    }
    attachCanvasEvents() {
        this.canvas.addEventListener("click", (event) => this.handleCanvasClick(event));
        this.canvas.addEventListener("dblclick", (event) => this.handledblClick(event));
    }
    attachInputEvents() {
        this.cellInput.addEventListener("blur", () => this.saveCell());
        this.cellInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.saveCell();
            }
        });
    }
    attachMouseEvents() {
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvas.addEventListener('keydown', (event) => this.handlekeydown(event));
        window.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        window.addEventListener('mousemove', (event) => this.handleMouseDrag(event));
    }
    handlekeydown(event) {
        this.cellInput.focus();
    }
    handledblClick(event) {
        this.cellInput.focus();
    }
    handleMouseDown(event) {
        if (this.hoveredColBorder !== null) {
            this.resizingCol = this.hoveredColBorder;
            this.startX = event.clientX;
            this.startWidth = this.cols.widths[this.resizingCol];
            // Calculate initial preview line position
            let sum = 0;
            for (let i = 0; i <= this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.resizingColLeft = sum;
            this.previewLineX = sum + this.startWidth;
        }
        if (this.hoveredRowBorder !== null) {
            this.resizingRow = this.hoveredRowBorder;
            this.startY = event.clientY;
            this.startHeight = this.rows.heights[this.resizingRow];
            // Calculate initial preview line position
            let sum = 0;
            for (let i = 0; i <= this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            this.previewLineY = sum;
        }
    }
    handleMouseDrag(event) {
        if (this.resizingCol !== null && this.resizingColLeft !== null) {
            const dx = event.clientX - this.startX;
            const newWidth = Math.max(10, this.startWidth + dx);
            this.cols.setWidth(this.resizingCol, newWidth);
            this.grid.columnheaders(this.rows, this.cols); // Redraw headers
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.previewLineX = this.resizingColLeft + newWidth;
            // 🟢 Only draw preview line on overlay
            this.grid.drawPreviewLineOverlay(this.previewLineX);
        }
        if (this.resizingRow !== null) {
            const dy = event.clientY - this.startY;
            const newHeight = Math.max(10, this.startHeight + dy);
            this.rows.setHeight(this.resizingRow, newHeight);
            this.grid.rowheaders(this.rows, this.cols); // Redraw headers
            let sum = 0;
            for (let i = 0; i < this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            this.previewLineY = sum + newHeight;
            // Draw preview line horizontally on overlay
            this.grid.drawPreviewLineOverlayRow(this.previewLineY);
        }
    }
    handleMouseUp(event) {
        // Only do this if a column is being resized and a preview line exists
        if (this.resizingCol !== null && this.previewLineX !== null && this.resizingColLeft !== null) {
            // Calculate the sum of all column widths before the one being resized
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            // The new width is the preview line position minus the sum of previous widths
            const finalWidth = this.previewLineX - this.resizingColLeft;
            // Update the width in the cols object
            this.cols.setWidth(this.resizingCol, finalWidth);
            // Disable the preview line
            // this.previewLineX = null;
            this.grid.ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);
            //  Clear the overlay (removes preview line)
            this.grid.clearOverlay();
            // Redraw everything
            this.grid.drawRows(this.rows, this.cols);
            this.grid.drawCols(this.rows, this.cols);
            this.grid.columnheaders(this.rows, this.cols);
            this.grid.rowheaders(this.rows, this.cols);
            //  ADD: Redraw all cell contents!
            // This will draw all cells with data after resizing.
            for (const [key, cell] of this.cellManager.cellMap.entries()) {
                this.grid.drawCell(cell.row, cell.col, cell.value, this.rows, this.cols);
            }
        }
        // Reset the resizingCol state
        this.resizingCol = null;
        this.resizingColLeft = null;
        if (this.resizingRow !== null && this.previewLineY !== null) {
            let sum = 0;
            for (let i = 0; i < this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            const finalHeight = this.previewLineY - sum;
            this.rows.setHeight(this.resizingRow, finalHeight);
            this.grid.ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);
            this.grid.clearOverlay();
            this.grid.drawRows(this.rows, this.cols);
            this.grid.drawCols(this.rows, this.cols);
            this.grid.columnheaders(this.rows, this.cols);
            this.grid.rowheaders(this.rows, this.cols);
            for (const [key, cell] of this.cellManager.cellMap.entries()) {
                this.grid.drawCell(cell.row, cell.col, cell.value, this.rows, this.cols);
            }
        }
        this.resizingRow = null;
    }
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const threshold = 5; // px distance to detect border for resizing
        const headerHeight = this.rows.heights[0];
        const headerWidth = this.cols.widths[0];
        // Track if we found a border (for cursor)
        let foundBorder = false;
        // --- Check for column resizing (hovering near right edge of any column in header row) ---
        if (y < headerHeight) {
            let sum = 0;
            for (let col = 0; col < this.cols.n; col++) {
                sum += this.cols.widths[col];
                if (Math.abs(x - sum) < threshold) {
                    this.canvas.style.cursor = "ew-resize";
                    this.hoveredColBorder = col;
                    foundBorder = true;
                    break;
                }
            }
        }
        // --- Check for row resizing (hovering near bottom edge of any row in the header column) ---
        if (!foundBorder && x < headerWidth) {
            let sum = 0;
            for (let row = 0; row < this.rows.n; row++) {
                sum += this.rows.heights[row];
                if (Math.abs(y - sum) < threshold) {
                    this.canvas.style.cursor = "ns-resize";
                    this.hoveredRowBorder = row;
                    foundBorder = true;
                    break;
                }
            }
        }
        // --- Default cursor if not on any border ---
        if (!foundBorder) {
            this.canvas.style.cursor = "cell";
            this.hoveredColBorder = null;
            this.hoveredRowBorder = null;
        }
    }
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = findIndexFromCoord(x, this.cols.widths);
        const row = findIndexFromCoord(y, this.rows.heights);
        if (row < 0 || col < 0)
            return;
        this.selectedRow = row;
        this.selectedCol = col;
        const cellLeft = this.cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
        const cellTop = this.rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
        this.cellInput.style.display = "block";
        this.cellInput.style.position = "absolute";
        this.cellInput.style.left = cellLeft + "px";
        this.cellInput.style.top = cellTop + "px";
        this.cellInput.style.width = this.cols.widths[col] + "px";
        this.cellInput.style.height = this.rows.heights[row] + "px";
        // Prefill input with existing value
        const cell = this.cellManager.getCell(row, col);
        this.cellInput.value = cell && cell.value != null ? String(cell.value) : "";
        // this.cellInput.focus();
    }
    saveCell() {
        console.log(this.cellInput.value.length);
        if (this.selectedRow !== null &&
            this.selectedCol !== null
        // this.cellInput.value !== ''
        ) {
            this.cellManager.setCell(this.selectedRow, this.selectedCol, this.cellInput.value);
            // Redraw only the edited cell:
            this.grid.drawCell(this.selectedRow, this.selectedCol, this.cellInput.value, this.rows, this.cols);
        }
        this.cellInput.style.display = "none";
    }
}
