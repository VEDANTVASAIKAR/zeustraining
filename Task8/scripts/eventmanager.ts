import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord } from "./utils.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";
/**
 * Manages all event listeners for the grid and input elements.
 */
export class EventManager {
    selectedRow: number | null = null;
    selectedCol: number | null = null;

    constructor(
        public canvas: HTMLCanvasElement,
        public cellInput: HTMLInputElement,
        public rows: Rows,
        public cols: Cols,
        public grid: GridDrawer,
        public cellManager: CellManager
    ) {
        this.attachCanvasEvents();
        this.attachInputEvents();
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

    handleCanvasClick(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = findIndexFromCoord(x, this.cols.widths);
        const row = findIndexFromCoord(y, this.rows.heights);

        if (row < 0 || col < 0) return;

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
        if (
            this.selectedRow !== null &&
            this.selectedCol !== null
        ) {
            this.cellManager.setCell(
                this.selectedRow,
                this.selectedCol,
                this.cellInput.value
            );
            // Redraw only the edited cell:
            this.grid.drawCell(
                this.selectedRow,
                this.selectedCol,
                this.cellInput.value,
                this.rows,
                this.cols
            );
        }
        this.cellInput.style.display = "none";
    }
}