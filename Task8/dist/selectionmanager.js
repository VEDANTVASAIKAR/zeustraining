import { findIndexFromCoord, getExcelColumnLabel } from "./utils.js";
/**
 * Manages selection of cells and highlighting of corresponding headers
 */
export class selectionManager {
    constructor(griddrawer, rows, cols, cellmanager, canvas, statistics = null) {
        this.mouseMoveHandler = null;
        this.eventmanager = null;
        this.statistics = null;
        //for auto scroll
        this.lastX = 0;
        this.lastY = 0;
        this.autoScrollInterval = null;
        /**
         * Tracks the current selection of cells as a rectangle
         */
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
        // this.attachCanvasEvents();
        this.initKeyboardEvents();
    }
    seteventmanager(em) {
        this.eventmanager = em;
    }
    /**
     * Attaches event listeners to the canvas
     */
    // attachCanvasEvents() {
    //     this.canvas.addEventListener('pointerdown',(event) => this.handleMouseDown(event));
    //     document.addEventListener('pointerup',(event) => this.handlePointerUp(event));
    // }
    /**
     * Initializes keyboard event listeners for range selection with Shift+Arrow
     */
    initKeyboardEvents() {
        // Add event listener for keydown on the canvas or document
        this.canvas.addEventListener('keydown', (e) => this.handleKeyDown(e));
        // to save input while writing
        this.cellInput?.addEventListener("input", (e) => {
            // Save the current value to the cell model without hiding the input
            if (this.activeSelection?.startRow !== null && this.activeSelection?.startCol !== null) {
                const currentValue = this.cellInput?.value;
                if (this.activeSelection && currentValue) {
                    // Update the cell value in the model
                    this.cellmanager.setCell(this.activeSelection.startRow, this.activeSelection.startCol, currentValue);
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
                // Update visual selection
                this.extendSelection(currentselectedrow, currentselectedcol);
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
        // console.log(this.activeSelection);
        // Clear and redraw the grid with the new selection
        this.griddrawer.rendervisible(this.rows, this.cols);
        // Apply the new selection highlighting
        this.paintSelectedCells(Math.min(this.activeSelection.startRow, this.activeSelection.endRow), Math.min(this.activeSelection.startCol, this.activeSelection.endCol), Math.max(this.activeSelection.startRow, this.activeSelection.endRow), Math.max(this.activeSelection.startCol, this.activeSelection.endCol));
        // console.log(this.activeSelection.endRow, this.activeSelection.endCol);
        //SCROLL LOGIC
        // Last Compute cell's absolute position and dimensions in the virtual grid
        const cellLeft = this.cols.widths.slice(0, this.activeSelection.endCol).reduce((a, b) => a + b, 0);
        const cellTop = this.rows.heights.slice(0, this.activeSelection.endRow).reduce((a, b) => a + b, 0);
        const cellWidth = this.cols.widths[this.activeSelection.endCol];
        const cellHeight = this.rows.heights[this.activeSelection.endRow];
        //  Get the current viewport dimensions and scroll positions
        const viewportLeft = this.container.scrollLeft;
        const viewportTop = this.container.scrollTop;
        const viewportRight = viewportLeft + this.container.clientWidth;
        const viewportBottom = viewportTop + this.container.clientHeight;
        //  Check if the cell is outside the viewport and scroll ONLY if necessary
        // Check horizontal scroll
        const horizontalBuffer = 100;
        if (cellLeft < viewportLeft + horizontalBuffer) {
            this.container.scrollLeft = Math.max(0, cellLeft - horizontalBuffer);
        }
        else if (cellLeft + cellWidth > viewportRight) {
            this.container.scrollLeft = cellLeft + cellWidth - this.container.clientWidth;
        }
        // Check horizontal scroll with reduced speed (25% of full scroll) for drag scroll
        // if (cellLeft < viewportLeft) {
        //     // Calculate full scroll amount needed
        //     const fullScrollAmount = viewportLeft - cellLeft;
        //     // Apply only 25% of it
        //     this.container.scrollLeft -= fullScrollAmount * 0.50;
        // } else if (cellLeft + cellWidth > viewportRight) {
        //     // Calculate full scroll amount needed
        //     const fullScrollAmount = (cellLeft + cellWidth) - viewportRight;
        //     // Apply only 25% of it
        //     this.container.scrollLeft += fullScrollAmount * 0.50;
        // }
        // Check vertical scroll
        const verticalBuffer = 25;
        if (cellTop < viewportTop + verticalBuffer) {
            this.container.scrollTop = Math.max(0, cellTop - verticalBuffer);
        }
        // Dispatch selection changed event
        this.dispatchSelectionChangeEvent();
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
     *
     * @param {number} row - The row index of the cell
     * @param {number} col - The column index of the cell
     * @param {string|number|null} value - The value to display in the cell
     * @param {Rows} rows - The rows manager
     * @param {Cols} cols - The columns manager
     */
    paintCell(row, col, value, rows, cols) {
        if (!this.ctx || !this.activeSelection) {
            return;
        }
        // ---- POSITION CALCULATION ----
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
        // ---- CELL TYPE DETERMINATION ----
        // Determine cell types for styling decisions
        const isHeader = row === 0 || col === 0;
        // New: check if this header is part of any header-based selection
        const isMultiSelectedHeader = this.selectionarr && this.isHeaderSelectedByAnySelection(row, col);
        // Get normalized selection range
        const minRow = Math.min(this.activeSelection.startRow, this.activeSelection.endRow);
        const maxRow = Math.max(this.activeSelection.startRow, this.activeSelection.endRow);
        const minCol = Math.min(this.activeSelection.startCol, this.activeSelection.endCol);
        const maxCol = Math.max(this.activeSelection.startCol, this.activeSelection.endCol);
        // Check if selection started from headers (row 0 or col 0)
        const selectionStartedFromRowHeader = this.activeSelection.startCol === 0;
        const selectionStartedFromColHeader = this.activeSelection.startRow === 0;
        // Determine header selection status based on selection origin
        const isSelectedColumnHeader = row === 0 && col > 0 && selectionStartedFromColHeader &&
            col >= minCol && col <= maxCol;
        const isSelectedRowHeader = col === 0 && row > 0 && selectionStartedFromRowHeader &&
            row >= minRow && row <= maxRow;
        // For highlighted header (when normal cell is selected)
        const isHighlightedColumnHeader = row === 0 && col > 0 &&
            col >= minCol && col <= maxCol &&
            !selectionStartedFromColHeader;
        const isHighlightedRowHeader = col === 0 && row > 0 &&
            row >= minRow && row <= maxRow &&
            !selectionStartedFromRowHeader;
        // ---- DRAWING CELL BACKGROUND ----
        // Clear the cell area
        this.ctx.clearRect(drawX, drawY, w, h);
        // Apply the appropriate fill style based on cell type and selection state
        if (isMultiSelectedHeader) {
            // Paint all multi-selected headers dark green
            this.ctx.fillStyle = "#0a753a";
            this.ctx.fillRect(drawX, drawY, w, h);
        }
        else if (isSelectedColumnHeader || isSelectedRowHeader) {
            // Fallback for single selection
            this.ctx.fillStyle = "#0a753a";
            this.ctx.fillRect(drawX, drawY, w, h);
        }
        else if (isHighlightedColumnHeader || isHighlightedRowHeader) {
            this.ctx.fillStyle = "rgba(202,234,216,1)";
            this.ctx.fillRect(drawX, drawY, w, h);
        }
        else if (isHeader) {
            this.ctx.fillStyle = "rgba(245,245,245,1)";
            this.ctx.fillRect(drawX, drawY, w, h);
        }
        else {
            this.ctx.fillStyle = "rgba(202,234,216,1)";
            this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
        }
        // For non-selected, non-highlighted headers, do not fill anything (leave as default)
        // ---- DRAWING CELL BORDERS ----
        // Draw standard light gray borders for all cells
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        // Draw special borders for selection edges and headers
        this.ctx.strokeStyle = "rgb(19, 126, 67)"; // Green border color for all special borders
        this.ctx.lineWidth = 2; // Thicker line for all special borders
        // For regular cell selection borders
        if (!isHeader) {
            const isTopEdge = row === minRow;
            const isBottomEdge = row === maxRow;
            const isLeftEdge = col === minCol;
            const isRightEdge = col === maxCol;
            // Only add borders if this cell is at an edge of the selection
            if (isTopEdge || isBottomEdge || isLeftEdge || isRightEdge) {
                this.ctx.beginPath();
                // Draw only the borders that are at selection edges
                if (isTopEdge) {
                    this.ctx.moveTo(drawX, drawY);
                    this.ctx.lineTo(drawX + w, drawY);
                }
                if (isBottomEdge) {
                    this.ctx.moveTo(drawX, drawY + h);
                    this.ctx.lineTo(drawX + w, drawY + h);
                }
                if (isLeftEdge) {
                    this.ctx.moveTo(drawX, drawY);
                    this.ctx.lineTo(drawX, drawY + h);
                }
                if (isRightEdge) {
                    this.ctx.moveTo(drawX + w, drawY);
                    this.ctx.lineTo(drawX + w, drawY + h);
                }
                this.ctx.stroke();
            }
        }
        // Draw special header borders
        if (isSelectedColumnHeader || isHighlightedColumnHeader) {
            // Draw bottom border for column header
            this.ctx.beginPath();
            this.ctx.moveTo(drawX + 0.5, drawY + h - 0.5);
            this.ctx.lineTo(drawX + w - 0.5, drawY + h - 0.5);
            this.ctx.stroke();
        }
        if (isSelectedRowHeader || isHighlightedRowHeader) {
            // Draw right border for row header
            this.ctx.beginPath();
            this.ctx.moveTo(drawX + w - 0.5, drawY + 0.5);
            this.ctx.lineTo(drawX + w - 0.5, drawY + h - 0.5);
            this.ctx.stroke();
        }
        // Reset to default line width
        this.ctx.lineWidth = 1;
        // ---- DRAWING TEXT ----
        // Draw the text
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        // Use white text for dark green headers, black for everything else
        this.ctx.fillStyle = (isSelectedColumnHeader || isSelectedRowHeader) ? "#FFFFFF" : "#000";
        this.ctx.font = "12px Arial";
        this.ctx.fillText(value != null ? String(value) : "", drawX + w / 2, drawY + h / 2);
    }
    paintSelectedCells(startRow, startCol, endRow, endCol) {
        // Ensure the range is properly normalized
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        // console.log(`Painting selection from (${minRow}, ${minCol}) to (${maxRow}, ${maxCol})`);
        // Paint all cells in the selection range
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                // Get the cell value
                const cell = this.cellmanager.getCell(r, c);
                const value = cell ? cell.value : null;
                // Paint each cell with selection highlight
                this.paintCell(r, c, value, this.rows, this.cols);
            }
        }
        // Additionally highlight the row headers for all selected rows
        for (let r = minRow; r <= maxRow; r++) {
            // Paint row header with highlight
            const headerValue = r;
            this.paintCell(r, 0, headerValue, this.rows, this.cols);
        }
        // Additionally highlight the column headers for all selected columns
        for (let c = minCol; c <= maxCol; c++) {
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
        // console.log(this.activeSelection);
        // If we have an active selection, redraw it completely
        if (this.activeSelection) {
            // First normalize the selection coordinates
            const startRow = Math.min(this.activeSelection.startRow, this.activeSelection.endRow);
            const endRow = Math.max(this.activeSelection.startRow, this.activeSelection.endRow);
            const startCol = Math.min(this.activeSelection.startCol, this.activeSelection.endCol);
            const endCol = Math.max(this.activeSelection.startCol, this.activeSelection.endCol);
            this.paintSelectedCells(startRow, startCol, endRow, endCol);
            // Calculate the border position
            let startX = 0;
            for (let i = 0; i < startCol; i++) {
                startX += this.cols.widths[i];
            }
            let startY = 0;
            for (let i = 0; i < startRow; i++) {
                startY += this.rows.heights[i];
            }
            // Calculate width and height
            let width = 0;
            for (let i = startCol; i <= endCol; i++) {
                width += this.cols.widths[i];
            }
            let height = 0;
            for (let i = startRow; i <= endRow; i++) {
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
    handlePointerDown(event) {
        this.startAutoScroll();
        console.log('selectionmanager: handlePointerDown');
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Check for column header click (fixed at the top)
        if (y < this.rows.heights[0] && x > this.cols.widths[0]) {
            const virtualX = x + this.container.scrollLeft;
            const col = findIndexFromCoord(virtualX, this.cols.widths);
            if (event.ctrlKey) {
                const colSelection = {
                    startRow: 0,
                    startCol: col,
                    endRow: this.rows.n - 1,
                    endCol: col
                };
                this.selectionarr.push(colSelection);
            }
            else {
                this.selectionarr = [];
            }
            //set first row active
            this.eventmanager?.setActiveCell(1, col);
            // Initialize selection with the full column
            // Setting startRow=0 indicates it started from a column header
            this.activeSelection = {
                startRow: 0, // Start from header row
                startCol: col,
                endRow: this.rows.n - 1,
                endCol: col
            };
            this.mouseMoveHandler = (moveEvent) => {
                const moveRect = this.canvas.getBoundingClientRect();
                const moveX = moveEvent.clientX - moveRect.left + this.container.scrollLeft;
                const currentCol = findIndexFromCoord(moveX, this.cols.widths);
                if (currentCol > 0) {
                    this.selectMultipleColumns(col, currentCol);
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
            if (event.ctrlKey) {
                const rowSelection = {
                    startRow: row,
                    startCol: 0,
                    endRow: row,
                    endCol: this.cols.n - 1
                };
                this.selectionarr.push(rowSelection);
            }
            else {
                this.selectionarr = [];
            }
            //set first cell active
            this.eventmanager?.setActiveCell(row, 1);
            // Initialize selection with the full row
            // Setting startCol=0 indicates it started from a row header
            this.activeSelection = {
                startRow: row,
                startCol: 0, // Start from header column
                endRow: row,
                endCol: this.cols.n - 1
            };
            this.mouseMoveHandler = (moveEvent) => {
                const moveRect = this.canvas.getBoundingClientRect();
                const moveY = moveEvent.clientY - moveRect.top + this.container.scrollTop;
                const currentRow = findIndexFromCoord(moveY, this.rows.heights);
                if (currentRow > 0) {
                    this.selectMultipleRows(row, currentRow);
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
        // Initialize activeSelection with the clicked cell
        this.activeSelection = {
            startRow: row,
            startCol: col,
            endRow: row,
            endCol: col
        };
        this.paintSelectedCells(row, col, row, col);
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
        this.mouseMoveHandler = (event) => this.handlePointerMove(event, visibleX, visibleY, row, col);
        this.container.addEventListener('pointermove', this.mouseMoveHandler);
        // console.log(this.activeSelection);
        // Dispatch selection change event
        this.dispatchSelectionChangeEvent();
    }
    handlePointerMove(event, visibleX, visibleY, initialRow, initialCol) {
        console.log('slectionmanager: handlePointerMove');
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Add scroll offset to get position in the virtual grid
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const currentCol = findIndexFromCoord(virtualX, this.cols.widths);
        const currentRow = findIndexFromCoord(virtualY, this.rows.heights);
        // Clear and redraw the grid
        if (!this.ctx) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.griddrawer.rendervisible(this.rows, this.cols);
        // Preserve the original start point for drag direction detection
        // but update the current end point
        this.activeSelection = {
            startRow: initialRow,
            startCol: initialCol,
            endRow: currentRow,
            endCol: currentCol
        };
        // Dispatch selection change event
        this.dispatchSelectionChangeEvent();
        //uncontrolled scroll
        this.extendSelection(currentRow, currentCol);
        // // Calculate visual feedback for drag operation
        // let startTopX = visibleX;
        // let startTopY = visibleY;
        // let width = 0;
        // let height = 0;
        // // Calculate width based on the distance between columns
        // if (currentCol >= initialCol) {
        //     // Selection going right
        //     for (let i = initialCol; i <= currentCol; i++) { 
        //         width += this.cols.widths[i];
        //     }
        // } else {
        //     // Selection going left
        //     for (let i = currentCol; i <= initialCol; i++) {
        //         width += this.cols.widths[i];
        //     }
        //     // Adjust starting X position
        //     startTopX = visibleX - width + this.cols.widths[initialCol];
        // }
        // // Calculate height based on the distance between rows
        // if (currentRow >= initialRow) {
        //     // Selection going down
        //     for (let i = initialRow; i <= currentRow; i++) {
        //         height += this.rows.heights[i];
        //     }
        // } else {
        //     // Selection going up
        //     for (let i = currentRow; i <= initialRow; i++) {
        //         height += this.rows.heights[i];
        //     }
        //     // Adjust starting Y position
        //     startTopY = visibleY - height + this.rows.heights[initialRow];
        // }
    }
    handlePointerUp(event) {
        this.stopAutoScroll();
        if (this.mouseMoveHandler) {
            this.container.removeEventListener('pointermove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }
        this.lastX = 0;
        this.lastY = 0;
        console.log('selectionmanager: handlePointerUp');
        this.dispatchSelectionChangeEvent();
        // Calculate statistics on the selection
        // this.statistics?.printvalues();
        // this.statistics?.sum();
        // this.statistics?.min();
        // this.statistics?.max();
        // this.statistics?.avg();
        // this.statistics?.count();
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
        // Make sure we're only working with valid column indices
        startCol = Math.max(1, startCol); // Don't include header column (col 0)
        endCol = Math.max(1, endCol);
        // Normalize the range (in case of dragging right-to-left)
        const firstCol = Math.min(startCol, endCol);
        const lastCol = Math.max(startCol, endCol);
        // Clear any existing selection
        this.griddrawer.rendervisible(this.rows, this.cols);
        if (this.selectionarr.length > 0) {
            for (let selection of this.selectionarr) {
                this.paintSelectedCells(selection.startRow, selection.startCol, selection.endRow, selection.endCol);
            }
        }
        // Create a selection that spans all rows, but only the selected columns
        // Keep startRow=0 to indicate column header selection
        if (this.activeSelection) {
            this.activeSelection = {
                startRow: 0, // Preserve header origin 
                startCol: firstCol,
                endRow: this.rows.n - 1, // Last row
                endCol: lastCol
            };
        }
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
    /**
     * Handles multiple row selection via drag
     * @param startRow The starting row index
     * @param endRow The ending row index
     */
    selectMultipleRows(startRow, endRow) {
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
        // Keep startCol=0 to indicate row header selection
        if (this.activeSelection) {
            this.activeSelection = {
                startRow: firstRow,
                startCol: 0, // Preserve header origin
                endRow: lastRow,
                endCol: this.cols.n - 1 // Last column
            };
        }
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
    /**
     * HIT TEST
     */
    /**
     * Determines what element was clicked based on coordinates
     * @param clientX - Client X coordinate
     * @param clientY - Client Y coordinate
     * @returns String indicating what was hit: 'columnHeader', 'rowHeader', 'corner', 'cell', or 'none'
     */
    hitdown(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        // Convert to virtual coordinates with scroll
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);
        if (row || col) {
            return true;
        }
        // No valid element hit
        return false;
    }
    //helper function to detect headers selected in selection array
    isHeaderSelectedByAnySelection(row, col) {
        // Only applies to headers
        if (row === 0 && col > 0) {
            // Column header
            return this.selectionarr.some(sel => sel.startRow === 0 &&
                col >= Math.min(sel.startCol, sel.endCol) &&
                col <= Math.max(sel.startCol, sel.endCol));
        }
        else if (col === 0 && row > 0) {
            // Row header
            return this.selectionarr.some(sel => sel.startCol === 0 &&
                row >= Math.min(sel.startRow, sel.endRow) &&
                row <= Math.max(sel.startRow, sel.endRow));
        }
        return false;
    }
    //autoscroll functions
    startAutoScroll() {
        if (this.autoScrollInterval != null)
            return;
        this.autoScrollInterval = window.setInterval(() => this.autoScrollLogic(), 60);
    }
    stopAutoScroll() {
        if (this.autoScrollInterval !== null) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
    autoScrollLogic() {
        // Don't proceed if the mouseMoveHandler has been removed
        if (!this.mouseMoveHandler) {
            return;
        }
        // Don't proceed if lastX/Y are reset (indicating pointer up)
        if (this.lastX === 0 && this.lastY === 0) {
            return;
        }
        // Store original scroll position to check if we actually scrolled
        const originalScrollLeft = this.container.scrollLeft;
        const originalScrollTop = this.container.scrollTop;
        // Your existing autoscroll logic
        const SCROLL_BUFFER_RIGHT = 50;
        const SCROLL_BUFFER_LEFT = 250;
        const SCROLL_BUFFER_BOTTOM = 2;
        const SCROLL_BUFFER_TOP = 100;
        const SCROLL_STEP = 20;
        const viewportLeft = this.container.scrollLeft;
        const viewportRight = viewportLeft + this.container.clientWidth;
        const viewportTop = this.container.scrollTop;
        const viewportBottom = viewportTop + this.container.clientHeight;
        // Right edge
        if (this.lastX + this.container.scrollLeft > viewportRight - SCROLL_BUFFER_RIGHT) {
            this.container.scrollLeft += SCROLL_STEP;
        }
        // Left edge
        else if (this.lastX < SCROLL_BUFFER_LEFT) {
            this.container.scrollLeft -= SCROLL_STEP;
        }
        // Bottom edge
        if (this.lastY + this.container.scrollTop - 50 > viewportBottom - SCROLL_BUFFER_BOTTOM) {
            this.container.scrollTop += SCROLL_STEP;
        }
        // Top edge
        else if (this.lastY < SCROLL_BUFFER_TOP) {
            this.container.scrollTop -= SCROLL_STEP;
        }
        // Check if we actually scrolled
        const didScroll = (this.container.scrollLeft !== originalScrollLeft) ||
            (this.container.scrollTop !== originalScrollTop);
        // Only trigger synthetic event if we actually scrolled AND have an active handler
        if (didScroll && this.mouseMoveHandler) {
            // Create a synthetic pointer event at the last known position
            const syntheticEvent = new PointerEvent('pointermove', {
                clientX: this.lastX,
                clientY: this.lastY,
                // Add basic required properties
                bubbles: true,
                cancelable: true,
                view: window
            });
            // Call the mouseMoveHandler with this synthetic event
            this.mouseMoveHandler(syntheticEvent);
        }
    }
}
