import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord, getExcelColumnLabel } from "./utils.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";
import { EventManager } from "./eventmanager.js";
import { Cell } from "./cell.js";
import { Statistics } from "./statistics.js";

/**
 * Manages selection of cells and highlighting of corresponding headers
 */
export class selectionManager {
    griddrawer: GridDrawer;
    rows: Rows;
    cols: Cols;
    cellmanager: CellManager;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    container: HTMLElement;
    private mouseMoveHandler: ((event: PointerEvent) => void) | null = null;
    public eventmanager : EventManager | null= null;
    statistics : Statistics | null = null;
    selectionStartCell: { row: number, col: number } | null = null;
    selectionEndCell: { row: number, col: number } | null = null;
    activeSelection: {
    startRow: number;
    startCol: number; 
    endRow: number;
    endCol: number;
    } | null = null;
    selectionarr : SelectionRange[] =[] ;
    cellInput: HTMLInputElement | null = null;
    
    // Track the previously selected row and column to clear their highlighting
    private previousSelectedRow: number | null = null;
    private previousSelectedCol: number | null = null;

    constructor(
        griddrawer: GridDrawer, 
        rows: Rows, 
        cols: Cols, 
        cellmanager: CellManager, 
        canvas: HTMLCanvasElement,
        statistics : Statistics | null = null
        
    ) {
        this.container = document.querySelector('.container') as HTMLElement;
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics
        this.cellInput = document.getElementById("cellInput") as HTMLInputElement;
    
        
        this.attachCanvasEvents();
        this.initKeyboardEvents();


    }

    seteventmanager(em : EventManager){
        this.eventmanager = em
    }
    /**
     * Attaches event listeners to the canvas
     */
    attachCanvasEvents() {
        // this.canvas.addEventListener("click", (event) => this.handleCellClick(event));
        this.canvas.addEventListener('pointerdown',(event) => this.handleMouseDown(event));
        document.addEventListener('pointerup',()=> this.handlePointerUp());
        // console.log('Selection manager attached');
    }


    /**
     * Initializes keyboard event listeners for range selection with Shift+Arrow
     */
    private initKeyboardEvents() {
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
                if(this.activeSelection && currentValue){
                // Update the cell value in the model
                this.cellmanager.setCell(
                    this.activeSelection?.startRow,
                    this.activeSelection?.startCol,
                    currentValue
                );
                }
            }
            
        });

    }

    /**
     * Handles keydown events for selection manipulation
     * @param e The keyboard event
     */
    private handleKeyDown(e: KeyboardEvent) {
        // Only handle if we have an active selection
        if (!this.activeSelection) return;

      

        // handle arrow navigation

        if(e.key && ! e.shiftKey){
            let currentselectedrow = this.activeSelection.startRow;
            let currentselectedcol = this.activeSelection.startCol
                        

            

            let moved = false;

            switch(e.key){
                case 'ArrowUp':
                    // dont go above header
                    if(currentselectedrow > 1){
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
                    if(currentselectedcol > 1){
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
                default : if (
                        e.key.length === 1 && // Single character keys (letters, numbers, symbols)
                        !e.ctrlKey && 
                        !e.altKey && 
                        !e.metaKey &&
                        e.key !== 'ArrowUp' &&
                        e.key !== 'ArrowRight' &&
                        e.key !== 'ArrowLeft' &&
                        e.key !== 'ArrowDown'
                    ) {
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
            
            if (moved){
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

                this.eventmanager?.positionInput(currentselectedrow,currentselectedcol);
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
    private extendSelection(newEndRow: number, newEndCol: number) {
        if (!this.activeSelection) return;
        
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
        this.paintSelectedCells(
            Math.min(this.activeSelection.startRow, this.activeSelection.endRow),
            Math.min(this.activeSelection.startCol, this.activeSelection.endCol),
            Math.max(this.activeSelection.startRow, this.activeSelection.endRow),
            Math.max(this.activeSelection.startCol, this.activeSelection.endCol)
        );
        
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
            this.griddrawer.drawFixedRowHeader(
                this.previousSelectedRow, 
                this.rows, 
                this.cols,
                this.container.scrollTop
            );
        }
        
        // Clear previous column header if there was one
        if (this.previousSelectedCol !== null) {
            // Clear the column header (cell in row 0 of selected column)
            const columnLabel = getExcelColumnLabel(this.previousSelectedCol - 1);
                this.griddrawer.drawFixedColumnHeader(
                this.previousSelectedCol, 
                this.rows, 
                this.cols, 
                this.container.scrollLeft
            );
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
    paintCell(
        row: number,
        col: number,
        value: string | number | null,
        rows: Rows,
        cols: Cols,
    ) {
        if (!this.ctx) {
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
        let drawX: number, drawY: number;
        
        if (row === 0 && col === 0) {
            // Corner cell - always fixed at (0,0)
            drawX = 0;
            drawY = 0;
        } else if (row === 0) {
            // Column header - fixed at top but scrolls horizontally
            drawX = x - this.container.scrollLeft;
            drawY = 0;
        } else if (col === 0) {
            // Row header - fixed at left but scrolls vertically
            drawX = 0;
            drawY = y - this.container.scrollTop;
        } else {
            // Regular cell - scrolls both horizontally and vertically
            drawX = x - this.container.scrollLeft;
            drawY = y - this.container.scrollTop;
        }
        
        // ---- CELL TYPE DETERMINATION ----
        
        // Determine cell types for styling decisions
        const isHeader = row === 0 || col === 0;
        
        // Get normalized selection range if we have an active selection
        let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
        
        if (this.activeSelection) {
            minRow = Math.min(this.activeSelection.startRow, this.activeSelection.endRow);
            maxRow = Math.max(this.activeSelection.startRow, this.activeSelection.endRow);
            minCol = Math.min(this.activeSelection.startCol, this.activeSelection.endCol);
            maxCol = Math.max(this.activeSelection.startCol, this.activeSelection.endCol);
        }
        
        // Determine header selection status
        const isHeaderInitiatedSelection = 
            (this.selectionStartCell?.row === 0 || this.selectionStartCell?.col === 0);
        
        const isSelectedColumnHeader = 
            row === 0 && col > 0 && this.selectionStartCell?.row === 0 && 
            this.activeSelection && col >= minCol && col <= maxCol;
        
        const isSelectedRowHeader = 
            col === 0 && row > 0 && this.selectionStartCell?.col === 0 &&
            this.activeSelection && row >= minRow && row <= maxRow;
        
        // For highlighted header (when normal cell is selected)
        const isHighlightedColumnHeader = 
            row === 0 && col > 0 && this.activeSelection && 
            col >= minCol && col <= maxCol &&
            !isSelectedColumnHeader && 
            this.selectionStartCell?.row !== 0;

        const isHighlightedRowHeader = 
            col === 0 && row > 0 && this.activeSelection && 
            row >= minRow && row <= maxRow &&
            !isSelectedRowHeader &&
            this.selectionStartCell?.col !== 0;

        // ---- DRAWING CELL BACKGROUND ----
        
        // Clear the cell area
        this.ctx.clearRect(drawX, drawY, w, h);
        
        // Apply the appropriate fill style based on cell type and selection state
        if (isSelectedColumnHeader || isSelectedRowHeader) {
            // Headers that are part of a header-initiated selection get the dark green color
            this.ctx.fillStyle = "#0a753a";
            this.ctx.fillRect(drawX, drawY, w, h);
        } else if (isHeader) {
            // Regular selected headers (not header-initiated) get the light green highlight
            this.ctx.fillStyle = "rgba(202,234,216,1)";
            this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
        } else {
            // Regular selected cells get even lighter highlight
            this.ctx.fillStyle = "rgba(231,241,236,1)";
            this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
        }
        
        // ---- DRAWING CELL BORDERS ----
        
        // // Draw standard light gray borders for all cells
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        
        // Draw special borders for selection edges and headers
        this.ctx.strokeStyle = "rgb(19, 126, 67)"; // Green border color for all special borders
        this.ctx.lineWidth = 2;                    // Thicker line for all special borders
        
        // For regular cell selection borders
        if (!isHeader && this.activeSelection) {
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
        
        // Draw special header borders using a helper function to reduce redundancy
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
        this.ctx.fillText(
            value != null ? String(value) : "",
            drawX + w/2,
            drawY + h/2
        );
    }

    paintSelectedCells(startRow: number, startCol: number, endRow: number, endCol: number) {
        // Check if this is a header-initiated selection
        const isHeaderRowSelection = this.selectionStartCell?.col === 0;
        const isHeaderColSelection = this.selectionStartCell?.row === 0;
        
        // Loop through all cells in the selection range
        console.log(`Painting selection from (${startRow}, ${startCol}) to (${endRow}, ${endCol})`);
        
        // Ensure the range is properly normalized (important for drag left/up)
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        
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
        
        // Additionally highlight the row headers for all selected rows (using normalized range)
        for (let r = minRow; r <= maxRow; r++) {
            // Paint row header with highlight
            const headerValue = r;
            this.paintCell(r, 0, headerValue, this.rows, this.cols);
        }
        
        // Additionally highlight the column headers for all selected columns (using normalized range)
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
        console.log(this.activeSelection);
        
        // If we have an active selection, redraw it completely
        if (this.activeSelection) {
            this.paintSelectedCells(
                this.activeSelection.startRow,
                this.activeSelection.startCol,
                this.activeSelection.endRow,
                this.activeSelection.endCol
            );
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

    handleMouseDown(event: PointerEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check for column header click (fixed at the top)
        if (y < this.rows.heights[0] && x > this.cols.widths[0]) {
            const virtualX = x + this.container.scrollLeft;
            const col = findIndexFromCoord(virtualX, this.cols.widths);

            // Find the first visible row to set as active
            const firstVisibleRow = findIndexFromCoord(this.container.scrollTop, this.rows.heights) + 1;

            if(event.ctrlKey){
                const colSelection: SelectionRange = {
                    startRow: 1,
                    startCol: col,
                    endRow: this.rows.n - 1,
                    endCol: col
                };
                this.selectionarr.push(colSelection);
            } else {
                this.selectionarr = [];
                const colSelection: SelectionRange = {
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
            } else {
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
        if (x < this.cols.widths[0] && y < this.rows.heights[0]) return;

        // Regular cell click
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);

        if (row < 1 || col < 1) return;
        
        // IMPORTANT: Clear any previous header-initiated selections
        // This ensures headers return to normal state after clicking a regular cell
        if (this.selectionStartCell?.row === 0 || this.selectionStartCell?.col === 0) {
            // We're transitioning from a header selection to a cell selection
            // Reset the selection state completely and redraw the grid
            this.selectionStartCell = null;
            this.selectionEndCell = null;
            this.griddrawer.rendervisible(this.rows, this.cols);
        }
        
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

    handleMouseDrag(event: PointerEvent, visibleX: number, visibleY: number, row: number, col: number) {
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

    // The end cell is (currentRow, currentCol)
    this.selectionEndCell = { row: currentRow, col: currentCol };

    // Always normalize the coordinates for the selection
    const minRow = Math.min(row, currentRow);
    const maxRow = Math.max(row, currentRow);
    const minCol = Math.min(col, currentCol);
    const maxCol = Math.max(col, currentCol);

    // Clear and redraw the grid
    if (!this.ctx) {
        return;
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.griddrawer.rendervisible(this.rows, this.cols);

    // IMPORTANT: Update the active selection immediately with the normalized range
    this.activeSelection = {
        startRow: minRow,
        startCol: minCol,
        endRow: maxRow,
        endCol: maxCol
    };

    // Paint all cells in the selection range - use the normalized range
    this.paintSelectedCells(minRow, minCol, maxRow, maxCol);

    // Calculate width and height for the border drawing
    let width: number = 0;
    let height: number = 0;

    // Calculate width based on the distance between columns
    if (currentCol >= col) {
        // Selection going right
        for (let i = col; i <= currentCol; i++) { 
            width += this.cols.widths[i];
        }
    } else {
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
    } else {
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

    // Dispatch selection change event
    this.dispatchSelectionChangeEvent();

    // Excel-like selection styling
    // this.ctx.fillStyle = "rgba(231, 241, 236, 1)";  
    // this.ctx.strokeStyle = "rgb(19, 126, 67,1)";      
    // this.ctx.lineWidth = 1;                         
    
    // // Draw the border
    // this.ctx.strokeRect(startTopX, startTopY, width, height);
}

    handlePointerUp() {
        if (this.mouseMoveHandler) {
            this.container.removeEventListener('pointermove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }
        console.log(this.activeSelection);
        if(this.activeSelection){
            // this.selectionarr.push(this.activeSelection)
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

        this.statistics?.printvalues()
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
        if (!this.activeSelection) return;
        
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
    selectMultipleColumns(startCol: number, endCol: number) {
        // console.log(`Selecting columns ${startCol} to ${endCol}`);

        
        // Make sure we're only working with valid column indices
        startCol = Math.max(1, startCol); // Don't include header column (col 0)
        endCol = Math.max(1, endCol);
        
        // Normalize the range (in case of dragging right-to-left)
        const firstCol = Math.min(startCol, endCol);
        const lastCol = Math.max(startCol, endCol);
        
        // Clear any existing selection
        this.griddrawer.rendervisible(this.rows, this.cols);
        if(this.selectionarr){
                    for (let selection of this.selectionarr){
                        // Paint this range
                        // console.log(selection);
                        
                        this.paintSelectedCells(
                            selection.startRow,
                            selection.startCol,
                            selection.endRow,
                            selection.endCol)
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
    selectMultipleRows(startRow: number, endRow: number) {
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
            this.paintSelectedCells(
                selection.startRow,
                selection.startCol,
                selection.endRow,
                selection.endCol
            );
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


interface SelectionRange {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}