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
        this.startX = 0; // Where the drag started (for calculations)
        this.startWidth = 0; // Initial width of the column
        /** Position of the preview line when resizing */
        this.previewLineX = null;
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
        window.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        window.addEventListener('mousemove', (event) => this.handleMouseDrag(event));
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
            this.previewLineX = sum;
        }
    }
    handleMouseDrag(event) {
        if (this.resizingCol !== null) {
            const dx = event.clientX - this.startX;
            const newWidth = Math.max(10, this.startWidth + dx);
            // Calculate where the preview line should be
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.previewLineX = sum + newWidth;
            // Only draw the preview line, don't resize yet
            this.grid.drawPreviewLine(this.previewLineX);
        }
    }
    handleMouseUp(event) {
        if (this.resizingCol !== null && this.previewLineX !== null) {
            // Calculate the final width based on preview position
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            const finalWidth = this.previewLineX - sum;
            // Actually resize the column
            this.cols.setWidth(this.resizingCol, finalWidth);
            // Clear preview line
            this.previewLineX = null;
            // Redraw everything once
            this.grid.redrawAll(this.rows, this.cols);
        }
        this.resizingCol = null;
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
                    this.canvas.style.cursor = "col-resize";
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
                    this.canvas.style.cursor = "row-resize";
                    this.hoveredRowBorder = row;
                    foundBorder = true;
                    break;
                }
            }
        }
        // --- Default cursor if not on any border ---
        if (!foundBorder) {
            this.canvas.style.cursor = "default";
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
        this.cellInput.focus();
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
