import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord } from "./utils.js";

/**
 * Manages all event listeners for the grid and input elements.
 */
export class EventManager {
    /**
     * Creates an EventManager.
     * @param {HTMLCanvasElement} canvas - The grid canvas element.
     * @param {HTMLInputElement} cellInput - The input element for cell editing.
     * @param {Rows} rows - The Rows instance.
     * @param {Cols} cols - The Cols instance.
     */
    constructor(
        /** @type {HTMLCanvasElement} The canvas element for the grid */
        public canvas: HTMLCanvasElement,
        /** @type {HTMLInputElement} The input element for editing cells */
        public cellInput: HTMLInputElement,
        /** @type {Rows} The rows manager */
        public rows: Rows,
        /** @type {Cols} The columns manager */
        public cols: Cols
    ) {
        this.attachCanvasEvents();
    }

    /**
     * Attaches all relevant events to the canvas.
     */
    attachCanvasEvents() {
        this.canvas.addEventListener("click", (event) => this.handleCanvasClick(event));
    }

    /**
     * Handles click events on the canvas, showing and positioning the input box.
     * @param {MouseEvent} event - The click event.
     */
    handleCanvasClick(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate row and col using utility
        const col = findIndexFromCoord(x, this.cols.widths);
        const row = findIndexFromCoord(y, this.rows.heights);

        if (row < 0 || col < 0) return; // Out of bounds

        // Calculate cell top-left position
        const cellLeft = this.cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
        const cellTop = this.rows.heights.slice(0, row).reduce((a, b) => a + b, 0);

        // Position and display the input box
        this.cellInput.style.display = "block";
        this.cellInput.style.position = "absolute";
        this.cellInput.style.left = cellLeft + "px";
        this.cellInput.style.top = cellTop + "px";
        this.cellInput.style.width = this.cols.widths[col] + "px";
        this.cellInput.style.height = this.rows.heights[row] + "px";
        this.cellInput.value = ""; // Later: set to cell value
        this.cellInput.focus();
    }
}