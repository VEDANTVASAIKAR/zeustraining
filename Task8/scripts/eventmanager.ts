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
    container : HTMLElement;
    /** @type {number | null} The index of the column border currently hovered for resizing */
    hoveredColBorder: number | null = null;
    /** @type {number | null} The index of the row border currently hovered for resizing */
    hoveredRowBorder: number | null = null;
    // Add in EventManager class
    resizingCol: number | null = null; // Which column is being resized
    startX: number = 0;                // Where the drag started (for calculations)
    startWidth: number = 0;            // Initial width of the column
    /** Position of the preview line when resizing */
    private previewLineX: number | null = null;

    constructor(
        public canvas: HTMLCanvasElement,
        public cellInput: HTMLInputElement,
        public rows: Rows,
        public cols: Cols,
        public grid: GridDrawer,
        public cellManager: CellManager
    ) {
        this.container = document.querySelector('.container') as HTMLElement;
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

    handleMouseDown(event: MouseEvent) {
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

    handleMouseDrag(event: MouseEvent) {
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

handleMouseUp(event: MouseEvent) {
        // Only do this if a column is being resized and a preview line exists
        if (this.resizingCol !== null && this.previewLineX !== null) {
            // Calculate the sum of all column widths before the one being resized
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            // The new width is the preview line position minus the sum of previous widths
            const finalWidth = this.previewLineX - sum;
            
            // Update the width in the cols object
            this.cols.setWidth(this.resizingCol, finalWidth);

            // Disable the preview line
            this.previewLineX = null;
            
            // Redraw everything
            this.grid.drawRows(this.rows, this.cols);
            this.grid.drawCols(this.rows, this.cols);
            this.grid.columnheaders(this.rows, this.cols);
            this.grid.rowheaders(this.rows, this.cols);
        }
        // Reset the resizingCol state
        this.resizingCol = null;
    }



    handleMouseMove(event: MouseEvent) {
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

        console.log(this.cellInput.value.length);
        
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
                this.cols
            );
        }
        this.cellInput.style.display = "none";
        
    }
}