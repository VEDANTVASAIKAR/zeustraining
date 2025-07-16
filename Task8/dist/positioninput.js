import { Painter } from "./paint.js";
/**
 * Manages listening for selection changes and positions the input element
 * on the first editable cell (not header) of the current selection.
 */
export class SelectionInputManager {
    constructor(container, cellInput, griddrawer, rows, cols, cellmanager) {
        this.selection = null;
        this.selectionarr = [];
        this.container = container;
        this.cellInput = cellInput;
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.listenSelectionChange();
    }
    /**
     * Listen to selection-changed events and update cell input position.
     * Also triggers Painter to redraw selections.
     */
    listenSelectionChange() {
        window.addEventListener('selection-changed', (e) => {
            if (e.detail) {
                this.selection = e.detail.selection;
                this.selectionarr = e.detail.selectionarr;
                Painter.paintSelectedCells(this.griddrawer.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
                this.positionInputOnSelection();
            }
        });
    }
    /**
     * Positions the input element on the first editable cell of the selection.
     * If the selection is on a header (row 0 or col 0), moves to the next cell below/right.
     * Sets input size to match the cell.
     * Hides input if selection is invalid.
     */
    positionInputOnSelection() {
        if (!this.selection) {
            this.cellInput.style.display = "none";
            return;
        }
        let { startRow, startCol } = this.selection;
        // If selected cell is header (row 0 or col 0), move to next editable cell
        if (startRow === 0 && startCol === 0) {
            startRow = 1;
            startCol = 1;
        }
        else if (startRow === 0) {
            startRow = 1;
        }
        else if (startCol === 0) {
            startCol = 1;
        }
        // Bounds check
        if (startRow >= this.rows.n ||
            startCol >= this.cols.n ||
            startRow < 1 ||
            startCol < 1) {
            this.cellInput.style.display = "none";
            return;
        }
        // Get cell value for input
        const cell = this.cellmanager.getCell(startRow, startCol);
        // console.log(`Positioning input on cell (${startRow}, ${startCol}) with value:`, cell?.value);
        // console.log(this.selection.startRow, this.selection.startCol);
        // const value = cell && cell.value !== undefined && cell.value !== null ? String(cell.value) : "";
        const value = this.cellmanager.getCell(this.selection.startRow, this.selection.startCol)?.value || "";
        // Calculate left/top based on cell position and scroll
        const left = this.getCellLeft(startCol);
        const top = this.getCellTop(startRow);
        const width = this.cols.widths[startCol];
        const height = this.rows.heights[startRow];
        // Set input style and show
        this.cellInput.style.left = `${left}px`;
        this.cellInput.style.top = `${top}px`;
        this.cellInput.style.width = `${width}px`;
        this.cellInput.style.height = `${height}px`;
        this.cellInput.style.display = "block";
        this.cellInput.value = value.toString();
    }
    /** Helper to get left position of a column */
    getCellLeft(col) {
        let left = 0;
        for (let i = 0; i < col; i++) {
            left += this.cols.widths[i];
        }
        return left;
    }
    /** Helper to get top position of a row */
    getCellTop(row) {
        let top = 0;
        for (let i = 0; i < row; i++) {
            top += this.rows.heights[i];
        }
        return top;
    }
}
