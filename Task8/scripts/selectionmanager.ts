import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord, getExcelColumnLabel } from "./utils.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";
import { Cell } from "./cell.js";

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

    // Track the previously selected row and column to clear their highlighting
    private previousSelectedRow: number | null = null;
    private previousSelectedCol: number | null = null;

    constructor(
        griddrawer: GridDrawer, 
        rows: Rows, 
        cols: Cols, 
        cellmanager: CellManager, 
        canvas: HTMLCanvasElement
    ) {
        this.container = document.querySelector('.container') as HTMLElement;
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.attachCanvasEvents();

        //Listen for keyboard navigation events from EventManager
        this.canvas.addEventListener("cell-selection-changed", (event: any) => {
            const { row, col } = event.detail;
            
            // Skip if selection is outside the grid or on headers
            if (row < 1 || col < 1) return;
            
            this.clearPreviousSelection();
            
            // Highlight the row header (cell in column 0 of selected row)
            this.paintCell(row, 0, row, this.rows, this.cols);
            
            // Highlight the column header (cell in row 0 of selected column)
            const columnLabel = getExcelColumnLabel(col - 1);
            this.paintCell(0, col, columnLabel, this.rows, this.cols);
            
            // Update tracking variables for next time
            this.previousSelectedRow = row;
            this.previousSelectedCol = col;
        });
    }

    /**
     * Attaches event listeners to the canvas
     */
    attachCanvasEvents() {
        this.canvas.addEventListener("click", (event) => this.handleCellClick(event));
        console.log('Selection manager attached');
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
     * Handles a single cell click event
     * @param {MouseEvent} event - The mouse click event
     */
    handleCellClick(event: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Add scroll offset to get position in the virtual grid
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;

        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);
        
        // Skip if we clicked on a header or outside the grid
        if (row < 1 || col < 1) return;
        
        // Clear previous header highlighting
        this.clearPreviousSelection();
        
        // Highlight the row header (cell in column 0 of selected row)
        this.paintCell(row, 0, row, this.rows, this.cols);
        
        // Highlight the column header (cell in row 0 of selected column)
        const columnLabel = getExcelColumnLabel(col - 1);
        this.paintCell(0, col, columnLabel, this.rows, this.cols);
        
        // Update tracking variables for next time
        this.previousSelectedRow = row;
        this.previousSelectedCol = col;
        
        console.log(`Selected cell: Row ${row}, Col ${col}`);
    }

    /**
     * Paints a cell with highlight color and displays the value
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
        
        if (!this.ctx) {
            return;
        }
        
        // Clear the cell area
        this.ctx.clearRect(drawX, drawY, w, h);
        
        // Fill with highlight color
        this.ctx.fillStyle = "rgba(202,234,216,1)"; // Green highlight color
        this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
        
        // Draw the borders
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
        
        // Draw the text
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "#000"; // Black text
        this.ctx.font = "12px Arial";
        this.ctx.fillText(
            value != null ? String(value) : "",
            drawX + w/2,
            drawY + h/2
        );
    }

    /**
     * Reapplies the current selection highlighting after scroll events
     */
    reapplySelectionHighlighting() {
        // If there's an active selection, rehighlight the headers
        if (this.previousSelectedRow !== null && this.previousSelectedCol !== null) {
            // Highlight row header
            this.paintCell(
                this.previousSelectedRow, 
                0, 
                this.previousSelectedRow, 
                this.rows, 
                this.cols
            );
            
            // Highlight column header
            const columnLabel = getExcelColumnLabel(this.previousSelectedCol - 1);
            this.paintCell(
                0, 
                this.previousSelectedCol, 
                columnLabel, 
                this.rows, 
                this.cols
            );
        }
    }
}