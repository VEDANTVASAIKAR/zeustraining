import { Line } from "./line.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { CellManager } from "./cellmanager.js";
import { getExcelColumnLabel } from "./utils.js";
import { selectionManager } from "./selectionmanager.js"; 
import { paintCell, Painter, SelectionRange } from "./paint.js";
import { drawVisibleColumnHeaders, drawVisibleRowHeaders } from "./paint.js";

/**
 * GridDrawer class is responsible for all canvas rendering operations
 * It handles drawing the grid, cells, and optimization for large datasets
 */
export class GridDrawer {
  selectionManager: selectionManager | null = null;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  cellmanager: CellManager;
  container: HTMLElement;
  rows: Rows; 
  cols: Cols; 
  overlay: HTMLCanvasElement;
  overlayCtx: CanvasRenderingContext2D;
  selection: { startRow: number; startCol: number; endRow: number; endCol: number; } | null = null;
  selectionarr: { startRow: number; startCol: number; endRow: number; endCol: number; }[] = [];

  constructor(canvasId: string, rows: Rows, cols: Cols, cellmanager: CellManager) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.container = document.querySelector('.container') as HTMLElement;
    this.overlay = document.getElementById('overlay') as HTMLCanvasElement;
    const ctx = this.canvas.getContext("2d");
    const overlayCtx = this.overlay.getContext("2d");
    this.cellmanager = cellmanager;
    if (!ctx || !overlayCtx) throw new Error("No 2D context");
    this.ctx = ctx;
    this.overlayCtx = overlayCtx;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.container.addEventListener('scroll', () => {
      this.canvas.style.transform = `translate(${this.container.scrollLeft}px, ${this.container.scrollTop}px)`;
      this.overlay.style.transform = `translate(${this.container.scrollLeft}px, ${this.container.scrollTop}px)`;
    });
    this.rows = rows;
    this.cols = cols;
    // Listen for selection changes
        window.addEventListener('selection-changed', (event: any) => {
            this.selection = event.detail.selection;
            this.selectionarr = event.detail.selectionarr || [];
        });
  }

  setSelectionManager(selectionManager: selectionManager) {
    this.selectionManager = selectionManager;     
  }

  columnheaders(rows: Rows, cols: Cols) {
    for (let j = 1; j < cols.n; j++) {
      let label = getExcelColumnLabel(j - 1);
      this.cellmanager.setCell(0, j, label);
      
    }     
  }

  rowheaders(rows: Rows, cols: Cols) {
    for (let i = 1; i <= rows.n; i++) {
      let label = i;
      this.cellmanager.setCell(i, 0, label);
     
    }
  }

  /** Modular function: Calculate the visible row/col range */
  getVisibleRange(rows: Rows, cols: Cols) {
    const scrollLeft = this.container.scrollLeft;
    const scrollTop = this.container.scrollTop;
    const viewportWidth = this.container.clientWidth;
    const viewportHeight = this.container.clientHeight;
    let rowSum = 0, startRow = 0;
    while (startRow < rows.n && rowSum < scrollTop) rowSum += rows.heights[startRow++]; 
    startRow = Math.max(0, startRow - 1);
    let endRow = startRow, rowEndSum = rowSum;
    while (endRow < rows.n && rowEndSum < scrollTop + viewportHeight) rowEndSum += rows.heights[endRow++];
    endRow = Math.min(rows.n - 1, endRow + 1);
    let colSum = 0, startCol = 0;
    while (startCol < cols.n && colSum < scrollLeft) colSum += cols.widths[startCol++];
    startCol = Math.max(0, startCol - 1);
    let endCol = startCol, colEndSum = colSum;
    while (endCol < cols.n && colEndSum < scrollLeft + viewportWidth) colEndSum += cols.widths[endCol++];
    endCol = Math.min(cols.n - 1, endCol + 1);
    return { startRow, endRow, startCol, endCol };
  }

  /** Modular function: Draw grid lines for the visible area */
  drawGridLines(startRow: number, endRow: number, startCol: number, endCol: number, rows: Rows, cols: Cols) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#e0e0e0";
    let yPos = 0; 
    for (let i = 0; i <= endRow; i++) {
      if (i >= startRow) {
        const lineY = yPos - this.container.scrollTop + 0.5;
        this.ctx.moveTo(0, lineY);
        this.ctx.lineTo(this.canvas.width, lineY);
      }
      yPos += rows.heights[i];
    }
    let xPos = 0;
    for (let i = 0; i <= endCol; i++) {
      if (i >= startCol) {
        const lineX = xPos - this.container.scrollLeft + 0.5;
        this.ctx.moveTo(lineX, 0);
        this.ctx.lineTo(lineX, this.canvas.height);
      }
      xPos += cols.widths[i];
    }
    this.ctx.stroke();
  }

  /** Modular function: Draw regular cells */
  drawVisibleCells(startRow: number, endRow: number, startCol: number, endCol: number, rows: Rows, cols: Cols) {
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row === 0 || col === 0) continue;
        const cell = this.cellmanager.getCell(row, col);
        const value = cell ? cell.value : null;
        if (cell) this.drawCell(row, col, value, rows, cols);
      }
    }
  }

  /** Modular function: Draw all row headers in visible range */
  drawVisibleRowHeaders(startRow: number, endRow: number, rows: Rows, cols: Cols) {
    for (let row = startRow; row <= endRow; row++) {
      if (row === 0) continue;
      this.drawFixedRowHeader(row, rows, cols, this.container.scrollTop);
    }
  }

  /** Modular function: Draw all column headers in visible range */
  drawVisibleColumnHeaders(startCol: number, endCol: number, rows: Rows, cols: Cols) {
    for (let col = startCol; col <= endCol; col++) {
      if (col === 0) continue;
      this.drawFixedColumnHeader(col, rows, cols, this.container.scrollLeft);
    }
  }

  /** Modular function: Draw the fixed corner cell */
  drawCorner(rows: Rows, cols: Cols) {
    this.drawFixedCornerCell(rows, cols);
  }

  /** Modular function: Clear canvas */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Main function: Renders only the visible part of the grid based on current scroll position */
  rendervisible(rows: Rows, cols: Cols) {
    this.clearCanvas();
    const { startRow, endRow, startCol, endCol } = this.getVisibleRange(rows, cols);
    this.drawGridLines(startRow, endRow, startCol, endCol, rows, cols);
    this.drawVisibleCells(startRow, endRow, startCol, endCol, rows, cols);
    this.drawVisibleRowHeaders(startRow, endRow, rows, cols);
    this.drawVisibleColumnHeaders(startCol, endCol, rows, cols);
    this.drawCorner(rows, cols);
  }

  drawFixedRowHeader(row: number, rows: Rows, cols: Cols, scrollTop: number) {
    let y = 0;
    for (let i = 0; i < row; i++) y += rows.heights[i];
    const x = 0, w = cols.widths[0], h = rows.heights[row], drawY = y - scrollTop, drawX = 0;
    if (drawY + h < 0 || drawY > this.canvas.height) return;
    this.ctx.clearRect(drawX, drawY, w, h);
    this.ctx.fillStyle = "rgba(245,245,245,0.95)";
    this.ctx.fillRect(drawX, drawY, w, h);
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(String(row), drawX + w / 2, drawY + h / 2);
  }

  drawFixedColumnHeader(col: number, rows: Rows, cols: Cols, scrollLeft: number) {
    let x = 0;
    for (let i = 0; i < col; i++) x += cols.widths[i];
    const y = 0, w = cols.widths[col], h = rows.heights[0], drawX = x - scrollLeft, drawY = 0;
    if (drawX + w < 0 || drawX > this.canvas.width) return;
    this.ctx.clearRect(drawX, drawY, w, h);
    this.ctx.fillStyle = "rgba(245,245,245,0.95)";
    this.ctx.fillRect(drawX, drawY, w, h);
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
    this.ctx.fillStyle = "#000";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    const label = getExcelColumnLabel(col - 1);
    this.ctx.fillText(label, drawX + w / 2, drawY + h / 2);
  }

  drawFixedCornerCell(rows: Rows, cols: Cols) {
    const w = cols.widths[0], h = rows.heights[0];
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = "rgba(245,245,245,1)";
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.strokeRect(0.5, 0.5, w, h);
  }

  drawCell(
    row: number,
    col: number,
    value: string | number | null,
    rows: Rows,
    cols: Cols,
  ) {
    const isHeader = row === 0 || col === 0;
    const x = cols.widths.slice(0, col).reduce((a, b) => a + b, 0);
    const y = rows.heights.slice(0, row).reduce((a, b) => a + b, 0);
    const w = cols.widths[col], h = rows.heights[row];
    const drawX = x - this.container.scrollLeft, drawY = y - this.container.scrollTop;
    this.ctx.clearRect(drawX, drawY, w, h);
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
    if (isHeader) {
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "rgba(245,245,245,1)";
      this.ctx.fillRect(drawX + 0.5, drawY + 0.5, w, h);
      this.ctx.fillStyle = "#000";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(
        value != null ? String(value) : "",
        drawX + w / 2,
        drawY + h / 2
      );
    } else {
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "#000";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(
        value != null ? String(value) : "",
        drawX + w / 2,
        drawY + h / 2
      );
    }
  }

  drawPreviewLineOverlay(x: number) {
    this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    this.overlayCtx.beginPath();
    this.overlayCtx.setLineDash([5, 5]);
    this.overlayCtx.moveTo(x, 0);
    this.overlayCtx.lineTo(x, this.overlay.height);
    this.overlayCtx.strokeStyle = '#107c41';
    this.overlayCtx.lineWidth = 2;
    this.overlayCtx.stroke();
    this.overlayCtx.setLineDash([]);
  }

  drawPreviewLineOverlayRow(y: number) {
    this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    this.overlayCtx.beginPath();
    this.overlayCtx.setLineDash([5, 5]);
    this.overlayCtx.moveTo(0, y);
    this.overlayCtx.lineTo(this.overlay.width, y);
    this.overlayCtx.strokeStyle = '#107c41';
    this.overlayCtx.lineWidth = 2;
    this.overlayCtx.stroke();
    this.overlayCtx.setLineDash([]);
  }

  clearOverlay() {
    this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
  }

  public paintSelectionsAndHeaders(
        ctx: CanvasRenderingContext2D = this.ctx,
        rows: Rows = this.rows,
        cols: Cols = this.cols,
        cellmanager: CellManager = this.cellmanager,
        container: HTMLElement = this.container,
        selection: SelectionRange | null = this.selection,
        selectionarr: SelectionRange[] = this.selectionarr
    ) {
        const { startRow, endRow, startCol, endCol } = this.getVisibleRange(rows, cols);

        // Paint selected cells and overlays
        Painter.paintSelectedCells(
            ctx,
            this,
            rows,
            cols,
            cellmanager,
            container,
            selection,
            selectionarr
        );
        // Paint sticky headers last (on top)
        drawVisibleColumnHeaders(startCol, endCol, rows, cols, container, ctx, selectionarr, selection!);
        drawVisibleRowHeaders(startRow, endRow, rows, cols, container, ctx, selectionarr, selection!);
    }
}