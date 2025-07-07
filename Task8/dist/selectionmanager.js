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
        this.selectionarr = [];
        this.cellInput = null;
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
        this.cellInput = document.getElementById("cellInput");
        this.attachCanvasEvents();
        this.initKeyboardEvents();
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
        // console.log('Selection manager attached');
    }
    /**
     * Initializes keyboard event listeners for range selection with Shift+Arrow
     */
    initKeyboardEvents() {
        // Add event listener for keydown on the canvas or document
        this.canvas.addEventListener('keydown', (e) => this.handleKeyDown(e));
        // this.cellInput?.addEventListener("keydown", (e) => {
        //     if (e.key === "Enter") {
        //         console.log('evecvesvcev');
        //         const currentValue = this.cellInput?.value;
        //             if(this.activeSelection && currentValue){
        //             // Update the cell value in the model
        //             this.cellmanager.setCell(
        //                 this.activeSelection?.startRow,
        //                 this.activeSelection?.startCol,
        //                 currentValue
        //             );
        //             if(this.activeSelection){
        //                 let currentselectedrow = this.activeSelection.startRow;
        //                 let currentselectedcol = this.activeSelection.startCol
        //                 currentselectedrow += 1
        //                 // Update selection based on whether Shift is held
        //                 this.activeSelection = {
        //                     startRow: currentselectedrow,
        //                     startCol: currentselectedcol,
        //                     endRow: currentselectedrow,
        //                     endCol: currentselectedcol
        //                 };
        //                 this.extendSelection(currentselectedrow+1, currentselectedcol+1);
        //                 this.eventmanager?.positionInput(currentselectedrow,currentselectedcol);
        //                 e.preventDefault();
        //             }
        //             this.griddrawer.rendervisible(this.rows,this.cols)
        //             }
        //         }        
        // });
        // to save input while writing
        this.cellInput?.addEventListener("input", (e) => {
            // Save the current value to the cell model without hiding the input
            if (this.activeSelection?.startRow !== null && this.activeSelection?.startCol !== null) {
                const currentValue = this.cellInput?.value;
                if (this.activeSelection && currentValue) {
                    // Update the cell value in the model
                    this.cellmanager.setCell(this.activeSelection?.startRow, this.activeSelection?.startCol, currentValue);
                }
            }
        });
    }
    /**
     * Handles keydown events for selection manipulation
     * @param e The keyboard event
     */
    handleKeyDown(e) {
        // Only handle if we have an active selection
        if (!this.activeSelection)
            return;
        // handle arrow navigation
        if (e.key && !e.shiftKey) {
            let currentselectedrow = this.activeSelection.startRow;
            let currentselectedcol = this.activeSelection.startCol;
            let moved = false;
            switch (e.key) {
                case 'ArrowUp':
                    // dont go above header
                    if (currentselectedrow > 1) {
                        currentselectedrow -= 1;
                        moved = true;
                    }
                    break;
                case 'ArrowDown':
                    // allow moving down 
                    currentselectedrow += 1;
                    moved = true;
                    break;
                case 'ArrowLeft':
                    // dont go left of the header
                    if (currentselectedcol > 1) {
                        currentselectedcol -= 1;
                        moved = true;
                    }
                    break;
                case 'ArrowRight':
                    // allow moving right
                    currentselectedcol += 1;
                    moved = true;
                    break;
                // Only focus and populate input on typing keys
                default: if (e.key.length === 1 && // Single character keys (letters, numbers, symbols)
                    !e.ctrlKey &&
                    !e.altKey &&
                    !e.metaKey &&
                    e.key !== 'ArrowUp' &&
                    e.key !== 'ArrowRight' &&
                    e.key !== 'ArrowLeft' &&
                    e.key !== 'ArrowDown') {
                    // Focus the input
                    this.cellInput?.focus();
                    // Prevent the key from also being added by the browser's default behavior
                    e.preventDefault();
                }
            }
            // Update selection based on whether Shift is held
            this.activeSelection = {
                startRow: currentselectedrow,
                startCol: currentselectedcol,
                endRow: currentselectedrow,
                endCol: currentselectedcol
            };
            if (moved) {
                // Hide the input during keyboard navigation if it's visible
                // if (this.cellInput && this.cellInput.style.display === 'block') {
                //     // Save current value first
                //     if (this.eventmanager) {
                //         this.eventmanager.saveCell();
                //     }
                //     this.cellInput.style.display = 'none';
                // }
                // Update visual selection
                this.extendSelection(currentselectedrow, currentselectedcol);
                // console.log(`Current selection: (${currentselectedrow}, ${currentselectedcol})`);
                this.eventmanager?.positionInput(currentselectedrow, currentselectedcol);
                e.preventDefault();
            }
        }
        // Check if shift key is pressed with arrow keys
        if (e.shiftKey) {
            let newEndRow = this.activeSelection.endRow;
            let newEndCol = this.activeSelection.endCol;
            let handled = true;
            switch (e.key) {
                case 'ArrowUp':
                    newEndRow = Math.max(1, this.activeSelection.endRow - 1);
                    break;
                case 'ArrowDown':
                    newEndRow = Math.min(this.rows.n - 1, this.activeSelection.endRow + 1);
                    break;
                case 'ArrowLeft':
                    newEndCol = Math.max(1, this.activeSelection.endCol - 1);
                    break;
                case 'ArrowRight':
                    newEndCol = Math.min(this.cols.n - 1, this.activeSelection.endCol + 1);
                    break;
                default:
                    handled = false;
                    break;
            }
            // If we handled an arrow key, update the selection
            if (handled) {
                e.preventDefault(); // Prevent default scrolling behavior
                // Update the selection
                this.extendSelection(newEndRow, newEndCol);
            }
        }
    }
    /**
     * Extends the current selection to a new end point
     * @param newEndRow The new end row for the selection
     * @param newEndCol The new end column for the selection
     */
    extendSelection(newEndRow, newEndCol) {
        if (!this.activeSelection)
            return;
        // Store the new end point (keep the same start point)
        this.activeSelection = {
            startRow: this.activeSelection.startRow,
            startCol: this.activeSelection.startCol,
            endRow: newEndRow,
            endCol: newEndCol
        };
        // Clear and redraw the grid with the new selection
        this.griddrawer.rendervisible(this.rows, this.cols);
        // Apply the new selection highlighting
        this.paintSelectedCells(Math.min(this.activeSelection.startRow, this.activeSelection.endRow), Math.min(this.activeSelection.startCol, this.activeSelection.endCol), Math.max(this.activeSelection.startRow, this.activeSelection.endRow), Math.max(this.activeSelection.startCol, this.activeSelection.endCol));
        // Dispatch selection changed event if you have that feature
        if (typeof this.dispatchSelectionChangeEvent === 'function') {
            this.dispatchSelectionChangeEvent();
        }
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
        console.log(`Painting selection from (${startRow}, ${startCol}) to (${endRow}, ${endCol})`);
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
        this.statistics?.max();
    }
    /**
     * Reapplies the current selection highlighting after scroll events
     */
    reapplySelectionHighlighting() {
        console.log(this.activeSelection);
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
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Check for column header click (fixed at the top)
        if (y < this.rows.heights[0] && x > this.cols.widths[0]) {
            const virtualX = x + this.container.scrollLeft;
            const col = findIndexFromCoord(virtualX, this.cols.widths);
            // Find the first visible row to set as active
            const firstVisibleRow = findIndexFromCoord(this.container.scrollTop, this.rows.heights) + 1;
            if (event.ctrlKey) {
                const colSelection = {
                    startRow: 1,
                    startCol: col,
                    endRow: this.rows.n - 1,
                    endCol: col
                };
                this.selectionarr.push(colSelection);
            }
            else {
                this.selectionarr = [];
                const colSelection = {
                    startRow: 1,
                    startCol: col,
                    endRow: this.rows.n - 1,
                    endCol: col
                };
                // this.selectionarr.push(colSelection);
            }
            this.eventmanager?.setActiveCell(firstVisibleRow, col);
            this.selectionStartCell = { row: 0, col: col };
            this.mouseMoveHandler = (moveEvent) => {
                const moveRect = this.canvas.getBoundingClientRect();
                const moveX = moveEvent.clientX - moveRect.left + this.container.scrollLeft;
                const currentCol = findIndexFromCoord(moveX, this.cols.widths);
                if (currentCol > 0) {
                    this.selectMultipleColumns(col, currentCol);
                    this.selectionEndCell = { row: 0, col: currentCol };
                }
            };
            this.container.addEventListener('pointermove', this.mouseMoveHandler);
            this.selectMultipleColumns(col, col);
            return;
        }
        // Check for row header click (fixed at the left)
        if (x < this.cols.widths[0] && y > this.rows.heights[0]) {
            const virtualY = y + this.container.scrollTop;
            const row = findIndexFromCoord(virtualY, this.rows.heights);
            // Find the first visible column to set as active
            const firstVisibleCol = findIndexFromCoord(this.container.scrollLeft, this.cols.widths) + 1;
            if (event.ctrlKey) {
                const rowSelection = {
                    startRow: row,
                    startCol: 1,
                    endRow: row,
                    endCol: this.cols.n - 1
                };
                this.selectionarr.push(rowSelection);
            }
            else {
                this.selectionarr = [];
                const rowSelection = {
                    startRow: row,
                    startCol: 1,
                    endRow: row,
                    endCol: this.cols.n - 1
                };
                // this.selectionarr.push(rowSelection);
            }
            this.eventmanager?.setActiveCell(row, firstVisibleCol);
            this.selectionStartCell = { row: row, col: 0 };
            this.mouseMoveHandler = (moveEvent) => {
                const moveRect = this.canvas.getBoundingClientRect();
                const moveY = moveEvent.clientY - moveRect.top + this.container.scrollTop;
                const currentRow = findIndexFromCoord(moveY, this.rows.heights);
                if (currentRow > 0) {
                    this.selectMultipleRows(row, currentRow);
                    this.selectionEndCell = { row: currentRow, col: 0 };
                }
            };
            this.container.addEventListener('pointermove', this.mouseMoveHandler);
            this.selectMultipleRows(row, row);
            return;
        }
        // Ignore corner cell click (top-left)
        if (x < this.cols.widths[0] && y < this.rows.heights[0])
            return;
        // Regular cell click
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);
        if (row < 1 || col < 1)
            return;
        this.selectionarr = [];
        this.eventmanager?.handleCanvasClick(event);
        this.griddrawer.rendervisible(this.rows, this.cols);
        this.activeSelection = { startRow: row, startCol: col, endRow: row, endCol: col };
        this.paintSelectedCells(row, col, row, col);
        this.selectionStartCell = { row, col };
        let topLeftX = 0;
        for (let i = 0; i < col; i++) {
            topLeftX += this.cols.widths[i];
        }
        let topLeftY = 0;
        for (let i = 0; i < row; i++) {
            topLeftY += this.rows.heights[i];
        }
        const visibleX = topLeftX - this.container.scrollLeft;
        const visibleY = topLeftY - this.container.scrollTop;
        this.mouseMoveHandler = (event) => this.handleMouseDrag(event, visibleX, visibleY, row, col);
        this.container.addEventListener('pointermove', this.mouseMoveHandler);
    }
    handleMouseDrag(event, visibleX, visibleY, row, col) {
        // console.log('hiiii');
        if (event.ctrlKey) {
            // console.log('hiiiiii');
        }
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
        // console.log(`${currentRow},${currentCol}`);
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
        // console.log(currentRow);
        // console.log(currentCol);
        if (this.selectionStartCell && this.selectionEndCell) {
            this.activeSelection = {
                startRow: startRow,
                startCol: startCol,
                endRow: currentRow,
                endCol: currentCol
            };
            // Dispatch the selection change event
            this.dispatchSelectionChangeEvent();
        }
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
        console.log(this.activeSelection);
        if (this.activeSelection) {
            this.selectionarr.push(this.activeSelection);
        }
        // // Handle column header drag selection specifically
        // if (this.selectionStartCell?.row === 0 && this.selectionEndCell?.row === 0) {
        //     // We've completed a column selection drag
        //     if (this.selectionStartCell.col > 0 && this.selectionEndCell.col > 0) {
        //         // Finalize the column selection
        //         this.selectMultipleColumns(this.selectionStartCell.col, this.selectionEndCell.col);
        //     }
        // }
        // // Handle row header drag selection
        // else if (this.selectionStartCell?.col === 0 && this.selectionEndCell?.col === 0) {
        //     // We've completed a row selection drag
        //     if (this.selectionStartCell.row > 0 && this.selectionEndCell.row > 0) {
        //         // Finalize the row selection
        //         this.selectMultipleRows(this.selectionStartCell.row, this.selectionEndCell.row);
        //     }
        // }
        // Save the final selection
        // if (this.selectionStartCell && this.selectionEndCell) {
        // this.activeSelection = {
        //     startRow: Math.min(this.selectionStartCell.row, this.selectionEndCell.row),
        //     startCol: Math.min(this.selectionStartCell.col, this.selectionEndCell.col),
        //     endRow: Math.max(this.selectionStartCell.row, this.selectionEndCell.row),
        //     endCol: Math.max(this.selectionStartCell.col, this.selectionEndCell.col)
        //     // endRow: this.selectionEndCell.row,
        //     // endCol: this.selectionEndCell.col
        // };
        // Dispatch the selection change event
        // this.dispatchSelectionChangeEvent();
        // }
        this.statistics?.printvalues();
        this.statistics?.sum();
        this.statistics?.min();
        this.statistics?.max();
        this.statistics?.avg();
        this.statistics?.count();
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
    /**
         * Handles multiple column selection via drag
         * @param startCol The starting column index
         * @param endCol The ending column index
         */
    selectMultipleColumns(startCol, endCol) {
        // console.log(`Selecting columns ${startCol} to ${endCol}`);
        // Make sure we're only working with valid column indices
        startCol = Math.max(1, startCol); // Don't include header column (col 0)
        endCol = Math.max(1, endCol);
        // Normalize the range (in case of dragging right-to-left)
        const firstCol = Math.min(startCol, endCol);
        const lastCol = Math.max(startCol, endCol);
        // Clear any existing selection
        this.griddrawer.rendervisible(this.rows, this.cols);
        if (this.selectionarr) {
            for (let selection of this.selectionarr) {
                // Paint this range
                // console.log(selection);
                this.paintSelectedCells(selection.startRow, selection.startCol, selection.endRow, selection.endCol);
            }
        }
        // Create a selection that spans all rows, but only the selected columns
        const newSelection = {
            startRow: 1,
            startCol: firstCol,
            endRow: this.rows.n - 1, // Last row
            endCol: lastCol
        };
        this.activeSelection = newSelection;
        // Reapply the selection highlighting
        this.reapplySelectionHighlighting();
        // Position the input at the first cell for potential editing
        // this.eventmanager?.positionInput(1, firstCol);
        // Dispatch selection changed event
        this.dispatchSelectionChangeEvent();
        // Update statistics if needed
        if (this.statistics) {
            this.statistics.sum();
            this.statistics.min();
            this.statistics.max();
            this.statistics.avg();
            this.statistics.count();
        }
    }
    /**
     * Handles multiple row selection via drag
     * @param startRow The starting row index
     * @param endRow The ending row index
     */
    selectMultipleRows(startRow, endRow) {
        // console.log(`Selecting rows ${startRow} to ${endRow}`);
        // Make sure we're only working with valid row indices
        startRow = Math.max(1, startRow); // Don't include header row (row 0)
        endRow = Math.max(1, endRow);
        // Normalize the range (in case of dragging bottom-to-top)
        const firstRow = Math.min(startRow, endRow);
        const lastRow = Math.max(startRow, endRow);
        // Clear any existing selection
        this.griddrawer.rendervisible(this.rows, this.cols);
        for (const selection of this.selectionarr) {
            this.paintSelectedCells(selection.startRow, selection.startCol, selection.endRow, selection.endCol);
        }
        // Create a selection that spans all columns, but only the selected rows
        const newSelection = {
            startRow: firstRow,
            startCol: 1,
            endRow: lastRow,
            endCol: this.cols.n - 1 // Last column
        };
        this.activeSelection = newSelection;
        // Reapply the selection highlighting
        this.reapplySelectionHighlighting();
        // Dispatch selection changed event
        this.dispatchSelectionChangeEvent();
        // Update statistics if needed
        if (this.statistics) {
            this.statistics.sum();
            this.statistics.min();
            this.statistics.max();
            this.statistics.avg();
            this.statistics.count();
        }
    }
}
