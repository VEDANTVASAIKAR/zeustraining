import { findIndexFromCoord, getExcelColumnLabel } from "./utils.js";
/**
 * Manages selection of cells and highlighting of corresponding headers
 */
export class selectionManager {
    constructor(griddrawer, rows, cols, cellmanager, canvas, statistics = null) {
        this.mouseMoveHandler = null;
        this.eventmanager = null;
        this.statistics = null;
        this.selectionStartCell = null;
        this.selectionEndCell = null;
        this.activeSelection = null;
        // Track the previously selected row and column to clear their highlighting
        this.previousSelectedRow = null;
        this.previousSelectedCol = null;
        this.container = document.querySelector('.container');
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics;
        this.attachCanvasEvents();
    }
    seteventmanager(em) {
        this.eventmanager = em;
    }
    /**
     * Attaches event listeners to the canvas
     */
    attachCanvasEvents() {
        // this.canvas.addEventListener("click", (event) => this.handleCellClick(event));
        this.canvas.addEventListener('pointerdown', (event) => this.handleMouseDown(event));
        document.addEventListener('pointerup', () => this.handlePointerUp());
        console.log('Selection manager attached');
    }
    /**
     * Clears previous selection highlighting from both cells and headers
     */
    clearPreviousSelection() {
        // Clear previous row header if there was one
        if (this.previousSelectedRow !== null) {
            // Clear the row header (cell in column 0 of selected row)
            this.griddrawer.drawFixedRowHeader(this.previousSelectedRow, this.rows, this.cols, this.container.scrollTop);
        }
        // Clear previous column header if there was one
        if (this.previousSelectedCol !== null) {
            // Clear the column header (cell in row 0 of selected column)
            const columnLabel = getExcelColumnLabel(this.previousSelectedCol - 1);
            this.griddrawer.drawFixedColumnHeader(this.previousSelectedCol, this.rows, this.cols, this.container.scrollLeft);
        }
        // Reset previous selection variables
        this.previousSelectedRow = null;
        this.previousSelectedCol = null;
    }
    /**
     * Paints a cell with highlight color and displays the value
     * @param {number} row - The row index of the cell
     * @param {number} col - The column index of the cell
     * @param {string|number|null} value - The value to display in the cell
     * @param {Rows} rows - The rows manager
     * @param {Cols} cols - The columns manager
     */
    paintCell(row, col, value, rows, cols) {
        // Calculate position in virtual grid
        let x = 0;
        for (let i = 0; i < col; i++) {
            x += cols.widths[i];
        }
        let y = 0;
        for (let i = 0; i < row; i++) {
            y += rows.heights[i];
        }
        const w = cols.widths[col];
        const h = rows.heights[row];
        // Position is handled differently for headers and regular cells
        let drawX, drawY;
        if (row === 0 && col === 0) {
            // Corner cell - always fixed at (0,0)
            drawX = 0;
            drawY = 0;
        }
        else if (row === 0) {
            // Column header - fixed at top but scrolls horizontally
            drawX = x - this.container.scrollLeft;
            drawY = 0;
        }
        else if (col === 0) {
            // Row header - fixed at left but scrolls vertically
            drawX = 0;
            drawY = y - this.container.scrollTop;
        }
        else {
            // Regular cell - scrolls both horizontally and vertically
            drawX = x - this.container.scrollLeft;
            drawY = y - this.container.scrollTop;
        }
        if (!this.ctx) {
            return;
        }
        // Clear the cell area
        this.ctx.clearRect(drawX, drawY, w, h);
        // Fill with highlight color
        if (row === 0 || col === 0) {
            // Header cells get stronger highlight
            this.ctx.fillStyle = "rgba(202,234,216,1)";
        }
        else {
            // Regular selected cells get lighter highlight
            this.ctx.fillStyle = "rgba(231,241,236,1)";
        }
        this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
        // Draw the borders
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        // Draw the text
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "#000"; // Black text
        this.ctx.font = "12px Arial";
        this.ctx.fillText(value != null ? String(value) : "", drawX + w / 2, drawY + h / 2);
    }
    //method to paint all cells in the selection
    paintSelectedCells(startRow, startCol, endRow, endCol) {
        // Loop through all cells in the selection range
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                // Get the cell value
                const cell = this.cellmanager.getCell(r, c);
                const value = cell ? cell.value : null;
                // Paint each cell with selection highlight
                // Use a lighter highlight for interior cells than for headers
                this.paintCell(r, c, value, this.rows, this.cols);
            }
        }
        // Additionally highlight the row headers for all selected rows
        for (let r = startRow; r <= endRow; r++) {
            // Paint row header with highlight
            this.paintCell(r, 0, r, this.rows, this.cols);
        }
        // Additionally highlight the column headers for all selected columns
        for (let c = startCol; c <= endCol; c++) {
            // Paint column header with highlight
            const columnLabel = getExcelColumnLabel(c - 1);
            this.paintCell(0, c, columnLabel, this.rows, this.cols);
        }
    }
    /**
     * Reapplies the current selection highlighting after scroll events
     */
    reapplySelectionHighlighting() {
        // If we have an active selection, redraw it completely
        if (this.activeSelection) {
            this.paintSelectedCells(this.activeSelection.startRow, this.activeSelection.startCol, this.activeSelection.endRow, this.activeSelection.endCol);
            // Calculate the border position
            let startX = 0;
            for (let i = 0; i < this.activeSelection.startCol; i++) {
                startX += this.cols.widths[i];
            }
            let startY = 0;
            for (let i = 0; i < this.activeSelection.startRow; i++) {
                startY += this.rows.heights[i];
            }
            // Calculate width and height
            let width = 0;
            for (let i = this.activeSelection.startCol; i <= this.activeSelection.endCol; i++) {
                width += this.cols.widths[i];
            }
            let height = 0;
            for (let i = this.activeSelection.startRow; i <= this.activeSelection.endRow; i++) {
                height += this.rows.heights[i];
            }
            // Adjust for scroll position to get visible coordinates
            const startTopX = startX - this.container.scrollLeft;
            const startTopY = startY - this.container.scrollTop;
            if (this.ctx) {
                // Draw the border with the same style as in your drag function
                this.ctx.strokeStyle = "rgb(19, 126, 67,1)";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(startTopX, startTopY, width, height);
            }
        }
    }
    handleMouseDown(event) {
        // Get your existing coordinates
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);
        // Ignore headers
        if (row < 1 || col < 1)
            return;
        // Tell EventManager about the click (for input positioning)
        this.eventmanager?.handleCanvasClick(event);
        // Redraw the grid to clear previous highlighting
        this.griddrawer.rendervisible(this.rows, this.cols);
        // Create a single cell selection immediately (this will be expanded if drag occurs)
        this.activeSelection = {
            startRow: row,
            startCol: col,
            endRow: row,
            endCol: col
        };
        // Apply initial selection (single cell and its headers)
        this.paintSelectedCells(row, col, row, col);
        // Store start position for potential dragging
        this.selectionStartCell = { row, col };
        // Calculate visible position for drag feedback
        let topLeftX = 0;
        for (let i = 0; i < col; i++) {
            topLeftX += this.cols.widths[i];
        }
        let topLeftY = 0;
        for (let i = 0; i < row; i++) {
            topLeftY += this.rows.heights[i];
        }
        // Adjust for scroll
        const visibleX = topLeftX - this.container.scrollLeft;
        const visibleY = topLeftY - this.container.scrollTop;
        // Set up the drag handler
        this.mouseMoveHandler = (event) => this.handleMouseDrag(event, visibleX, visibleY, row, col);
        this.container.addEventListener('pointermove', this.mouseMoveHandler);
    }
    handleMouseDrag(event, visibleX, visibleY, row, col) {
        console.log('hiiii');
        // The start cell is simply (row, col)
        this.selectionStartCell = { row, col };
        let startTopX = visibleX;
        let startTopY = visibleY;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Add scroll offset to get position in the virtual grid
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const currentCol = findIndexFromCoord(virtualX, this.cols.widths);
        const currentRow = findIndexFromCoord(virtualY, this.rows.heights);
        console.log(`${currentRow},${currentCol}`);
        // The end cell is (currentRow, currentCol)
        this.selectionEndCell = { row: currentRow, col: currentCol };
        // Determine the actual rectangle corners (normalize coordinates)
        const startRow = Math.min(row, currentRow);
        const startCol = Math.min(col, currentCol);
        const endRow = Math.max(row, currentRow);
        const endCol = Math.max(col, currentCol);
        // Clear and redraw the grid
        if (!this.ctx) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.griddrawer.rendervisible(this.rows, this.cols);
        // Paint all cells in the selection range
        this.paintSelectedCells(startRow, startCol, endRow, endCol);
        let width = 0;
        let height = 0;
        // Calculate width based on the distance between columns
        if (currentCol >= col) {
            // Selection going right
            for (let i = col; i <= currentCol; i++) {
                width += this.cols.widths[i];
            }
        }
        else {
            // Selection going left
            for (let i = currentCol; i <= col; i++) {
                width += this.cols.widths[i];
            }
            // Adjust starting X position
            startTopX = visibleX - width + this.cols.widths[col];
        }
        // Calculate height based on the distance between rows
        if (currentRow >= row) {
            // Selection going down
            for (let i = row; i <= currentRow; i++) {
                height += this.rows.heights[i];
            }
        }
        else {
            // Selection going up
            for (let i = currentRow; i <= row; i++) {
                height += this.rows.heights[i];
            }
            // Adjust starting Y position
            startTopY = visibleY - height + this.rows.heights[row];
        }
        if (!this.ctx) {
            return;
        }
        // // Clear the previous drawing
        // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // // Redraw the grid cells (you may need to call your grid's render method)
        // this.griddrawer.rendervisible(this.rows,this.cols);
        // Excel-like selection styling
        this.ctx.fillStyle = "rgba(231, 241, 236, 1)";
        this.ctx.strokeStyle = "rgb(19, 126, 67,1)";
        this.ctx.lineWidth = 1; // Border width
        // Draw the filled rectangle
        // this.ctx.fillRect(startTopX, startTopY, width, height);
        // Draw the border
        this.ctx.strokeRect(startTopX, startTopY, width, height);
    }
    handlePointerUp() {
        if (this.mouseMoveHandler) {
            this.container.removeEventListener('pointermove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }
        // Save the final selection
        if (this.selectionStartCell && this.selectionEndCell) {
            this.activeSelection = {
                startRow: Math.min(this.selectionStartCell.row, this.selectionEndCell.row),
                startCol: Math.min(this.selectionStartCell.col, this.selectionEndCell.col),
                endRow: Math.max(this.selectionStartCell.row, this.selectionEndCell.row),
                endCol: Math.max(this.selectionStartCell.col, this.selectionEndCell.col)
            };
            // Dispatch the selection change event
            this.dispatchSelectionChangeEvent();
        }
        this.statistics?.printvalues();
    }
    /**
     * Dispatches a selection-change event with the current selection details
     */
    dispatchSelectionChangeEvent() {
        if (!this.activeSelection)
            return;
        // Create a custom event with selection details
        const event = new CustomEvent('selection-changed', {
            detail: {
                selection: this.activeSelection
            }
        });
        // Dispatch the event from the canvas
        this.canvas.dispatchEvent(event);
    }
}
