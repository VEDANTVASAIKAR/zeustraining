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
        this.container = document.querySelector('.container');
        this.attachCanvasEvents();
        this.attachInputEvents();
    }
    redraw() {
        this.container.addEventListener('scroll', () => {
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
