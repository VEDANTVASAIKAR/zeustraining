import { Line } from "./line.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { CellManager } from "./cellmanager.js";
import { getExcelColumnLabel } from "./utils.js";

/**
 * GridDrawer class is responsible for all canvas rendering operations
 * It handles drawing the grid, cells, and optimization for large datasets
 */
export class GridDrawer {
  /** Canvas 2D rendering context */
  ctx: CanvasRenderingContext2D;
  /** Main canvas element */
  canvas: HTMLCanvasElement;
  /** Cell manager for accessing cell data */
  cellmanager: CellManager;
  /** Container element that holds the scrollable area */
  container: HTMLElement;
  /** Row manager instance */
  rows: Rows; 
  /** Column manager instance */
  cols: Cols; 
  /** Overlay canvas for temporary visual elements like resize guides */
  overlay: HTMLCanvasElement;
  /** Overlay canvas 2D rendering context */
  overlayCtx: CanvasRenderingContext2D;

  /**
   * Initializes the GridDrawer
   * @param canvasId - ID of the canvas element
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   * @param cellmanager - Cell manager instance
   */
  constructor(canvasId: string, rows: Rows, cols: Cols, cellmanager: CellManager) {
    // Get the main canvas element
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    // Get the container for scroll position tracking
    this.container = document.querySelector('.container') as HTMLElement;
    // Get the overlay canvas for temporary visual elements
    this.overlay = document.getElementById('overlay') as HTMLCanvasElement;

    // Get 2D rendering contexts for both canvases
    const ctx = this.canvas.getContext("2d");
    const overlayCtx = this.overlay.getContext("2d");
    
    // Store the cell manager reference
    this.cellmanager = cellmanager;
    
    // Ensure we have valid contexts
    if (!ctx || !overlayCtx) throw new Error("No 2D context");
    
    // Store contexts
    this.ctx = ctx;
    this.overlayCtx = overlayCtx;
    
    // Set canvas dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Store references to row and column managers
    this.rows = rows;
    this.cols = cols;
  }

  /**
   * Draws all horizontal grid lines
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  drawRows(rows: Rows, cols: Cols) {
    let y = 0;
    for (let i = 0; i <= rows.n; i++) {
      // Draw horizontal line at the top of each row
      const line = new Line(0, y + 0.5, cols.widths.reduce((a,b) => a+b, 0), y + 0.5);
      line.draw(this.ctx);
      if (i < rows.n) {
        y += rows.heights[i];
      }
    }
  }

  /**
   * Draws all vertical grid lines
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  drawCols(rows: Rows, cols: Cols) {
    let x = 0;
    for (let i = 0; i <= cols.n; i++) {
      // Draw vertical line at the left of each column
      const line = new Line(x + 0.5, 0, x + 0.5, rows.heights.reduce((a,b) => a+b, 0));
      line.draw(this.ctx);
      if (i < cols.n) {
        x += cols.widths[i];
      }
    }
  }

  /**
   * Draws all column headers (A, B, C, etc.)
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  columnheaders(rows: Rows, cols: Cols){
    for (let j=1; j < cols.n; j++){
      let label = getExcelColumnLabel(j-1);
      this.cellmanager.setCell(0, j, label);
      this.drawCell(0, j, label, rows, cols);
    }     
  }

  /**
   * Draws all row headers (1, 2, 3, etc.)
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  rowheaders(rows: Rows, cols: Cols){
    for(let i=1; i <= rows.n; i++){
      let label = i;
      this.cellmanager.setCell(i, 0, label);
      this.drawCell(i, 0, label, rows, cols);
    }
  }

  /**
   * Renders only the visible part of the grid based on current scroll position
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  rendervisible(rows: Rows, cols: Cols) {
    // Clear the entire canvas first
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get current scroll position from container
    const scrollLeft = this.container.scrollLeft;
    const scrollTop = this.container.scrollTop;
    
    console.log(`Scroll position: top=${scrollTop}, left=${scrollLeft}`);
    
    // Get viewport dimensions
    const viewportWidth = this.container.clientWidth;
    const viewportHeight = this.container.clientHeight;
    
    // Calculate visible range for rows
    let rowSum = 0;
    let startRow = 0;
    
    // Find the first visible row
    while (startRow < rows.n && rowSum < scrollTop) {
      rowSum += rows.heights[startRow];
      startRow++;
    }
    
    // Step back one row to ensure we include partially visible rows
    startRow = Math.max(0, startRow - 1);
    
    // Find the last visible row
    let endRow = startRow;
    let rowEndSum = rowSum;
    
    while (endRow < rows.n && rowEndSum < scrollTop + viewportHeight) {
      rowEndSum += rows.heights[endRow];
      endRow++;
    }
    
    // Add one more row as buffer
    endRow = Math.min(rows.n - 1, endRow + 1);
    
    // Calculate visible range for columns
    let colSum = 0;
    let startCol = 0;
    
    // Find the first visible column
    while (startCol < cols.n && colSum < scrollLeft) {
      colSum += cols.widths[startCol];
      startCol++;
    }
    
    // Step back one column to ensure we include partially visible columns
    startCol = Math.max(0, startCol - 1);
    
    // Find the last visible column
    let endCol = startCol;
    let colEndSum = colSum;
    
    while (endCol < cols.n && colEndSum < scrollLeft + viewportWidth) {
      colEndSum += cols.widths[endCol];
      endCol++;
    }
    
    // Add one more column as buffer
    endCol = Math.min(cols.n - 1, endCol + 1);
    
    // Log the visible range for debugging
    console.log(`Rendering rows ${startRow} to ${endRow}, columns ${startCol} to ${endCol}`);
    
    // Draw grid structure (lines) - Draw them across the whole viewport
    this.ctx.beginPath();
    this.ctx.strokeStyle = "black";
    
    // Draw horizontal lines for visible rows
    let yPos = 0;
    for (let i = 0; i <= endRow; i++) {
      if (i >= startRow) {
        // Draw line at the correct position accounting for scroll
        const lineY = yPos - scrollTop + 0.5;
        this.ctx.moveTo(0, lineY);
        this.ctx.lineTo(this.canvas.width, lineY);
      }
      yPos += rows.heights[i];
    }
    
    // Draw vertical lines for visible columns
    let xPos = 0;
    for (let i = 0; i <= endCol; i++) {
      if (i >= startCol) {
        // Draw line at the correct position accounting for scroll
        const lineX = xPos - scrollLeft + 0.5;
        this.ctx.moveTo(lineX, 0);
        this.ctx.lineTo(lineX, this.canvas.height);
      }
      xPos += cols.widths[i];
    }
    
    // Stroke all grid lines at once for better performance
    this.ctx.stroke();
    
    // Draw cell content for visible cells
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        // Get the cell or create header value as needed
        const cell = this.cellmanager.getCell(row, col);
        const value = cell ? cell.value : (
          row === 0 ? getExcelColumnLabel(col - 1) :
          col === 0 ? row : null
        );
        
        // Draw each cell individually
        if (row === 0 || col === 0 || cell) {
          this.drawVisibleCell(row, col, value, rows, cols, scrollLeft, scrollTop);
        }
      }
    }
    
    // Make sure the corner cell (0,0) is always drawn
    if (startRow === 0 && startCol === 0) {
      this.drawVisibleCell(0, 0, "", rows, cols, scrollLeft, scrollTop);
    }
  }

  /**
   * Draws a single cell with proper scroll position adjustment
   * @param row - Row index
   * @param col - Column index
   * @param value - Cell value
   * @param rows - Rows manager
   * @param cols - Cols manager
   * @param scrollLeft - Horizontal scroll position
   * @param scrollTop - Vertical scroll position
   */
  drawVisibleCell(
    row: number,
    col: number,
    value: string | number | null,
    rows: Rows,
    cols: Cols,
    scrollLeft: number,
    scrollTop: number
  ) {
    const isHeader = row === 0 || col === 0;
    
    // Calculate position in virtual grid
    let x = 0;
    for (let i = 0; i < col; i++) {
      x += cols.widths[i];
    }
    
    let y = 0;
    for (let i = 0; i < row; i++) {
      y += rows.heights[i];
    }
    
    // Get cell dimensions
    const w = cols.widths[col];
    const h = rows.heights[row];
    
    // Adjust for scroll position
    const drawX = x - scrollLeft;
    const drawY = y - scrollTop;
    
    // Skip cells that are completely outside viewport
    if (drawX + w < 0 || drawY + h < 0 || 
        drawX > this.canvas.width || drawY > this.canvas.height) {
      return;
    }
    
    // Clear cell area
    this.ctx.clearRect(drawX, drawY, w, h);
    
    // Fill header background if needed
    if (isHeader) {
      this.ctx.fillStyle = "rgba(245,245,245,1)";
      this.ctx.fillRect(drawX, drawY, w, h);
    }
    
    // Draw cell border
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
    
    // Draw cell text
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    
    if (isHeader) {
      // Center text for headers
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        value != null ? String(value) : "",
        drawX + w/2,
        drawY + h/2
      );
    } else {
      // Left-align text for regular cells
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(
        value != null ? String(value) : "",
        drawX + 4,
        drawY + h/2
      );
    }
    
    // Log for debugging specific cells
    if ((row === 0 && col === 0) || (row === 1 && col === 1)) {
      console.log(`Drew cell R${row}C${col} at (${drawX},${drawY}) size ${w}x${h}`);
    }
  }

  /**
   * Draws grid lines only for the visible part of the grid
   * @param startRow - First visible row
   * @param endRow - Last visible row
   * @param startCol - First visible column
   * @param endCol - Last visible column
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  drawVisibleGridLines(startRow: number, endRow: number, startCol: number, endCol: number, rows: Rows, cols: Cols) {
    // Calculate position of the first visible row
    let y = rows.heights.slice(0, startRow).reduce((a, b) => a + b, 0);
    
    // Draw horizontal grid lines for visible rows
    for (let i = startRow; i <= endRow; i++) {
      // Draw horizontal line at the top of each row
      const line = new Line(
        0 - this.container.scrollLeft, // Start from the left edge of the canvas, adjusted for scroll
        y + 0.5 - this.container.scrollTop, // Position adjusted for scroll
        cols.widths.reduce((a, b) => a + b, 0) - this.container.scrollLeft, // Full width
        y + 0.5 - this.container.scrollTop // Position adjusted for scroll
      );
      line.draw(this.ctx);
      
      if (i < rows.n) {
        y += rows.heights[i];
      }
    }
    
    // Calculate position of the first visible column
    let x = cols.widths.slice(0, startCol).reduce((a, b) => a + b, 0);
    
    // Draw vertical grid lines for visible columns
    for (let i = startCol; i <= endCol; i++) {
      // Draw vertical line at the left of each column
      const line = new Line(
        x + 0.5 - this.container.scrollLeft, // Position adjusted for scroll
        0 - this.container.scrollTop, // Start from the top edge of the canvas, adjusted for scroll
        x + 0.5 - this.container.scrollLeft, // Position adjusted for scroll
        rows.heights.reduce((a, b) => a + b, 0) - this.container.scrollTop // Full height
      );
      line.draw(this.ctx);
      
      if (i < cols.n) {
        x += cols.widths[i];
      }
    }
  }


  /**
   * Draws headers for the visible area
   * @param startRow - First visible row
   * @param endRow - Last visible row
   * @param startCol - First visible column
   * @param endCol - Last visible column
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  drawVisibleHeaders(startRow: number, endRow: number, startCol: number, endCol: number, rows: Rows, cols: Cols) {
    // Draw row headers that are in the visible range
    for (let row = startRow; row <= endRow; row++) {
      if (row > 0) { // Skip the corner cell (0,0)
        this.drawCell(row, 0, row, rows, cols);
      }
    }
    
    // Draw column headers that are in the visible range
    for (let col = startCol; col <= endCol; col++) {
      if (col > 0) { // Skip the corner cell (0,0)
        const label = getExcelColumnLabel(col - 1);
        this.drawCell(0, col, label, rows, cols);
      }
    }
    
    // Always draw the corner cell (0,0)
    this.drawCell(0, 0, "", rows, cols);
  }

  /**
   * Draws a single cell with its value
   * @param row - Row index of the cell
   * @param col - Column index of the cell
   * @param value - Value to display in the cell
   * @param rows - Row manager instance
   * @param cols - Column manager instance
   */
  drawCell(
    row: number,
    col: number,
    value: string | number | null,
    rows: Rows,
    cols: Cols,
  ) {
    // Determine if this is a header cell
    const isHeader = row === 0 || col === 0;

    // Calculate cell position in virtual space (the entire grid)
    const x = cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
    const y = rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
    const w = cols.widths[col];
    const h = rows.heights[row];

    // Adjust position for current scroll (to display in viewport)
    const drawX = x - this.container.scrollLeft;
    const drawY = y - this.container.scrollTop;

    // Clear the cell area
    this.ctx.clearRect(drawX, drawY, w, h);

    // Draw cell border
    this.ctx.strokeStyle = "black";
    this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);

    // Handle header cells differently (with background)
    if(isHeader) {
        // Center text in header cells
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        
        // Gray background for headers
        this.ctx.fillStyle = "rgba(245,245,245,1)";
        this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w, h);
        
        // Text styling
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        
        // Draw the text centered in the cell
        this.ctx.fillText(
            value != null ? String(value) : "",
            drawX + w/2,
            drawY + h/2
        );
    } else {
        // Left-align text in regular cells
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        
        // Draw the text with a small padding from the left
        this.ctx.fillText(
            value != null ? String(value) : "",
            drawX + 4,
            drawY + h/2
        );
    }
  }

  /**
   * Draws a vertical preview line during column resizing
   * @param x - X-coordinate where to draw the line
   */
  drawPreviewLineOverlay(x: number) {
    // Clear the overlay canvas
    this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    
    // Begin drawing the dashed line
    this.overlayCtx.beginPath();
    this.overlayCtx.setLineDash([5, 5]); // Dashed line pattern
    this.overlayCtx.moveTo(x, 0);
    this.overlayCtx.lineTo(x, this.overlay.height);
    this.overlayCtx.strokeStyle = '#000';
    this.overlayCtx.lineWidth = 2;
    this.overlayCtx.stroke();
    this.overlayCtx.setLineDash([]); // Reset dash pattern
  }

  /**
   * Draws a horizontal preview line during row resizing
   * @param y - Y-coordinate where to draw the line
   */
  drawPreviewLineOverlayRow(y: number) {
    // Clear the overlay canvas
    this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    
    // Begin drawing the dashed line
    this.overlayCtx.beginPath();
    this.overlayCtx.setLineDash([5, 5]); // Dashed line pattern
    this.overlayCtx.moveTo(0, y);
    this.overlayCtx.lineTo(this.overlay.width, y);
    this.overlayCtx.strokeStyle = '#000';
    this.overlayCtx.lineWidth = 2;
    this.overlayCtx.stroke();
    this.overlayCtx.setLineDash([]); // Reset dash pattern
  }

  /** Clears the overlay canvas */
  clearOverlay() {
    this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
  }
}