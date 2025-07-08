import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord } from "./utils.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";
import { selectionManager } from "./selectionmanager.js";
import { getExcelColumnLabel } from "./utils.js";
/**
 * Manages all event listeners for the grid and input elements.
 */
export class EventManager {
    selectedRow: number ;
    selectedCol: number ;
    container : HTMLElement;
    /** @type {number | null} The index of the column border currently hovered for resizing */
    hoveredColBorder: number | null = null;
    /** @type {number | null} The index of the row border currently hovered for resizing */
    hoveredRowBorder: number | null = null;
    // Add in EventManager class
    resizingCol: number | null = null; // Which column is being resized
    resizingRow : number | null = null ;
    startX: number = 0;                // Where the drag started (for calculations)
    startWidth: number = 0;            // Initial width of the column
    startY: number = 0;
    startHeight: number = 0;
    private previewLineY: number | null = null;
    /** Position of the preview line when resizing */
    private previewLineX: number | null = null;
    private resizingColLeft: number | null = null;

    constructor(
        public canvas: HTMLCanvasElement,
        public cellInput: HTMLInputElement,
        public rows: Rows,
        public cols: Cols,
        public grid: GridDrawer,
        public cellManager: CellManager,
        public selectionManager: selectionManager
        
    ) {
        // Initialize selection to cell A1 (row 1, col 1 since row 0 and col 0 are headers)
        this.selectedRow = 1;
        this.selectedCol = 1;
        this.container = document.querySelector('.container') as HTMLElement;
        this.attachCanvasEvents();
        // this.attachInputEvents();
        this.redraw();
        // this.attachMouseEvents();
        // Position the input in cell A1 immediately
        this.positionInput();
        // this.notifySelectionChange();
        this.canvas.focus();
        
    }

    redraw() {
        // Use requestAnimationFrame to throttle scroll events
        let ticking = false;
        
        // Initial render when the page loads
        this.grid.rendervisible(this.rows, this.cols);
        
        this.container.addEventListener('scroll', (e) => {
            // console.log("Scroll");
            // Check if input is visible (user is editing)
            const isEditing = this.cellInput.style.display === 'block';

        
        // Only update the input box if it's visible
        if (isEditing) {
            // console.log(`${this.cellInput.value}`);
            // console.log(this.selectedCol)
            // console.log(this.selectedRow)
            this.cellManager.setCell(this.selectedRow,this.selectedCol,this.cellInput.value)
        }

        // Only schedule a new rendering if we're not already in the middle of one
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // console.log("Rendering grid after scroll");
                this.grid.rendervisible(this.rows, this.cols);
                
                // After rendering is complete, reapply any current selection highlighting
                if (this.selectionManager) {
                    this.selectionManager.reapplySelectionHighlighting();
                }
                
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Also re-render on window resize
    window.addEventListener('resize', () => {
        // console.log("Window resize detected");
        if (!ticking) {
            window.requestAnimationFrame(() => {
                this.grid.rendervisible(this.rows, this.cols);
                
                // Also reapply selection highlighting after resize
                if (this.selectionManager) {
                    this.selectionManager.reapplySelectionHighlighting();
                }
                
                ticking = false;
            });
            ticking = true;
        }
    });
    }

    attachCanvasEvents() {
        // this.canvas.addEventListener("pointerdown", (event) => this.handleCanvasClick(event));
        this.canvas.addEventListener("dblclick", (event) => this.handledblClick(event));
    }

    attachInputEvents() {
        this.cellInput.addEventListener("blur", () => this.saveCell());
            
    }



    // attachMouseEvents() {
    //     window.addEventListener('pointermove', (event) => this.handleMouseMove(event));
    //     this.canvas.addEventListener('pointerdown', (event) => this.handleMouseDown(event));
    //     window.addEventListener('pointerup', (event) => this.handleMouseUp(event));
    // }

 

    handledblClick(event : MouseEvent){
        this.cellInput.focus();
    }

    handlePointerDown(event: MouseEvent) {
        console.log('eventmanager: handlePointerDown');
        
        if (this.hoveredColBorder !== null) {
            this.resizingCol = this.hoveredColBorder;
            this.startX = event.clientX; 
            this.startWidth = this.cols.widths[this.resizingCol];
            
            // Calculate initial preview line position
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.resizingColLeft = sum;
            this.previewLineX = sum + this.cols.widths[this.resizingCol];
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


    handleMouseUp(event: MouseEvent) {
        

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
            this.grid.ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);
            //  Clear the overlay (removes preview line)
            this.grid.clearOverlay();
            // Redraw everything
            this.grid.rendervisible(this.rows,this.cols)
            //  ADD: Redraw all cell contents!
            // This will draw all cells with data after resizing.
            for (const [key, cell] of this.cellManager.cellMap.entries()) {
                this.grid.drawCell(cell.row, cell.col, cell.value, this.rows, this.cols);
            }
            this.updateInputBoxIfVisible();
        }
        // Reset the resizingCol state
        this.resizingCol = null;
        this.resizingColLeft = null;


            // Only do this if a row is being resized and a preview line exists
        if (this.resizingRow !== null && this.previewLineY !== null) {
            // Calculate the sum of all row heights before the one being resized
            let sum = 0;
            for (let i = 0; i < this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            // The new height is the preview line position minus the sum of previous heights
            const finalHeight = this.previewLineY - sum;
            
            // Update the height in the rows object
            this.rows.setHeight(this.resizingRow, finalHeight);

            // Disable the preview line
            this.grid.ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);

            // Clear the overlay (removes preview line)
            this.grid.clearOverlay();

            // Redraw everything
            this.grid.rendervisible(this.rows, this.cols)

            // ADD: Redraw all cell contents!
            // This will draw all cells with data after resizing.
            for (const [key, cell] of this.cellManager.cellMap.entries()) {
                this.grid.drawCell(cell.row, cell.col, cell.value, this.rows, this.cols);
            }
            this.updateInputBoxIfVisible();
        }
        // Reset the resizingRow state
        this.resizingRow = null;
        this.previewLineY = null;

    }



    // First, fix handleMouseMove to use virtual coordinates for detection
    handleMouseMove(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate virtual coordinates with scroll offset
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;

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
                // Using virtualX to account for scroll position
                if (Math.abs(virtualX - sum) < threshold) {
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
                // Using virtualY to account for scroll position
                if (Math.abs(virtualY - sum) < threshold) {
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

            // console.log(this.previewLineX);
            
            // Only draw preview line on overlay
            const adjustedPreviewLineX = this.previewLineX - this.container.scrollLeft;
            this.grid.drawPreviewLineOverlay(adjustedPreviewLineX);
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

            // console.log(this.resizingRow);
            
            // Draw preview line horizontally on overlay
            const adjustedPreviewLineY = this.previewLineY - this.container.scrollTop;
            this.grid.drawPreviewLineOverlayRow(adjustedPreviewLineY);
        }
    }

    handleCanvasClick(event: PointerEvent) {
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Add scroll offset to get position in the virtual grid
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;

        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);

        

        // avoid editing headers
        if (row <= 0 || col <= 0) return;
        

        // Check if clicking on an already selected cell with visible input
        const isSameCell = (row === this.selectedRow && col === this.selectedCol);
        if (isSameCell && this.cellInput.style.display === "block") {
            // Prevent the browser's default focus behavior for the input
            event.preventDefault();
            event.stopPropagation();
            
            // Important: Explicitly keep focus on the canvas
            this.canvas.focus();
            return;
        }

        this.selectedRow = row;
        this.selectedCol = col;

        this.updateInputBoxIfVisible()

        // this.notifySelectionChange();

        // Keep focus on the canvas instead of the input
        this.canvas.focus();
    }

    saveCell() {
        // Get current scroll position from container
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;
        // console.log(this.cellInput.value.length);
        
        if (
            this.selectedRow !== null &&
            this.selectedCol !== null 
            // this.cellInput.value !== ''
           
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
                this.cols,
                
            );
        }
        this.cellInput.style.display = "block";
        
    }

    /**
     * Updates the input box position and size if it's currently visible
     */
    updateInputBoxIfVisible() {
        if (this.selectedRow !== null && this.selectedCol !== null) {
            this.positionInput();
        }
    }


    /**
     * Sets the active cell and positions the input, but does NOT scroll the container.
     * This is used for header clicks to avoid jumping the viewport.
     * @param row The row index of the new active cell.
     * @param col The col index of the new active cell.
     */
    setActiveCell(row: number, col: number) {
        // 1. Update the application's selected cell state
        this.selectedRow = row;
        this.selectedCol = col;

        // 2. Compute cell's absolute position and dimensions
        const cellLeft = this.cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
        const cellTop = this.rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
        const cellWidth = this.cols.widths[col];
        const cellHeight = this.rows.heights[row];

        // 3. Position the input element without scrolling
        this.cellInput.style.display = "block";
        this.cellInput.style.position = "absolute";
        this.cellInput.style.left = cellLeft + "px";
        this.cellInput.style.top = cellTop + "px";
        this.cellInput.style.width = cellWidth + "px";
        this.cellInput.style.height = cellHeight + "px";

        // 4. Set input's value
        const cell = this.cellManager.getCell(row, col);
        this.cellInput.value = cell && cell.value != null ? String(cell.value) : "";
    }

    /**
     * Positions the input box at the given cell, keeps it visible, and adjusts for scroll.
     * @param selectedRow The row index (1-based, must not be 0)
     * @param selectedCol The column index (1-based, must not be 0)
     */
    positionInput(selectedRow: number = this.selectedRow, selectedCol: number = this.selectedCol) {
        // 1. Update the application's selected cell state
        this.selectedRow = selectedRow;
        this.selectedCol = selectedCol;

        // 2. Compute cell's absolute position and dimensions in the virtual grid
        const cellLeft = this.cols.widths.slice(0, selectedCol).reduce((a, b) => a + b, 0);
        const cellTop = this.rows.heights.slice(0, selectedRow).reduce((a, b) => a + b, 0);
        const cellWidth = this.cols.widths[selectedCol];
        const cellHeight = this.rows.heights[selectedRow];

        // 3. Get the current viewport dimensions and scroll positions
        const viewportLeft = this.container.scrollLeft;
        const viewportTop = this.container.scrollTop;
        const viewportRight = viewportLeft + this.container.clientWidth;
        const viewportBottom = viewportTop + this.container.clientHeight;

        // 4. Check if the cell is outside the viewport and scroll ONLY if necessary
        // Check horizontal scroll
        if (cellLeft < viewportLeft) {
            this.container.scrollLeft = cellLeft;
        } else if (cellLeft + cellWidth > viewportRight) {
            this.container.scrollLeft = cellLeft + cellWidth - this.container.clientWidth;
        }
        // Check vertical scroll
        if (cellTop < viewportTop) {
            this.container.scrollTop = cellTop;
        } else if (cellTop + cellHeight > viewportBottom) {
            this.container.scrollTop = cellTop + cellHeight - this.container.clientHeight;
        }

        // 5. Position the input element. The position is always absolute to the scrollable container.
        this.cellInput.style.display = "block";
        this.cellInput.style.position = "absolute";
        this.cellInput.style.left = cellLeft + "px";
        this.cellInput.style.top = cellTop + "px";
        this.cellInput.style.width = cellWidth + "px";
        this.cellInput.style.height = cellHeight + "px";
        
        // 6. Set input's value from the cell manager
        const cell = this.cellManager.getCell(selectedRow, selectedCol);
        this.cellInput.value = cell && cell.value != null ? String(cell.value) : "";

        // 7. Prevent input click from stealing canvas focus
        this.cellInput.addEventListener('mousedown', (e) => {
            if (e.detail === 1) {
                e.preventDefault();
                e.stopPropagation();
                this.canvas.focus();
                return false;
            }
        }, { once: false });
    }


    /**
     HIT TESTS
     */

     /**
     * Tests if a pointer is over a resize handle
     * @param clientX - Mouse client X coordinate
     * @param clientY - Mouse client Y coordinate
     * @returns {boolean} True if the pointer is over a resize handle
     */
    isOverResizeHandle(clientX: number, clientY: number){

        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Calculate virtual coordinates with scroll offset
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;

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
                // Using virtualX to account for scroll position
                if (Math.abs(virtualX - sum) < threshold) {
                    this.canvas.style.cursor = "ew-resize";
                    this.hoveredColBorder = col;
                    foundBorder = true;
                    return true
                }
            }
        }else{
            return false
        }
        

    }

}