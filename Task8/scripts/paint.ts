import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { getExcelColumnLabel } from "./utils.js";
import { CellManager } from "./cellmanager.js";

/**
 * Represents a rectangular selection on the grid.
 * startRow/startCol is one corner, endRow/endCol is the opposite corner.
 */
export interface SelectionRange {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}

/**
 * Paints all selections in selectionarr (multi-selection).
 * Only paints cells and headers that are in the visible region (viewport).
 * Also paints rectangle overlays for selection blocks.
 * 
 * @param ctx - Canvas rendering context
 * @param griddrawer - Object responsible for grid rendering (not used for visible region)
 * @param rows - Rows dimension object
 * @param cols - Columns dimension object
 * @param cellmanager - Provides cell values
 * @param container - Scrollable container element
 * @param selectionarr - Array of selection ranges (multi-selection)
 */
export function paintMultiSelections(
    ctx: CanvasRenderingContext2D,
    griddrawer: any,
    rows: Rows,
    cols: Cols,
    cellmanager: CellManager,
    container: HTMLElement,
    selectionarr: SelectionRange[]
) {
    // Calculate the visible region for performance
    const visible = calculateVisibleRegion(rows, cols, container);

    for (const sel of selectionarr) {
        // Paint the selection block, cell-by-cell, but only within visible region
        paintSelectionBlock(ctx, rows, cols, cellmanager, container, sel, selectionarr, visible);

        // Paint a rectangle overlay for the selection block (drawn on top of cells)
        paintSelectionRectangle(ctx, rows, cols, container, sel, visible, false);
    }
}

/**
 * Main entry: Paints multi-selection and active selection.
 * Only visible region is painted. Also paints rectangle overlays.
 * This should be called on every selection change event, with both selection and selectionarr.
 * 
 * @param ctx - Canvas rendering context
 * @param griddrawer - Object responsible for grid rendering
 * @param rows, cols - dimension objects
 * @param cellmanager - Provides cell values
 * @param container - Scrollable container element
 * @param selection - Current active selection
 * @param selectionarr - Array of multi-selection ranges
 */
export class Painter {
    public static paintSelectedCells(
        ctx: CanvasRenderingContext2D,
        griddrawer: any,
        rows: Rows,
        cols: Cols,
        cellmanager: CellManager,
        container: HTMLElement,
        selection: SelectionRange | null,
        selectionarr: SelectionRange[]
    ) {
        if (!ctx) return;
        // Ensure grid is rendered (not responsible for selection painting)
        griddrawer.rendervisible(rows, cols);

        // Calculate visible region once for efficiency
        const visible = calculateVisibleRegion(rows, cols, container);

        // Paint all multi-selections first (lower z-order)
        for (const sel of selectionarr) {
            paintSelectionBlock(ctx, rows, cols, cellmanager, container, sel, selectionarr, visible);
            paintSelectionRectangle(ctx, rows, cols, container, sel, visible, false);
        }

        // Paint the current/active selection last (topmost z-order)
        if (selection) {
            paintSelectionBlock(ctx, rows, cols, cellmanager, container, selection, selectionarr, visible);
            paintSelectionRectangle(ctx, rows, cols, container, selection, visible, true);
        }
    }
}

/**
 * Calculates the first/last visible row and column based on container scroll and size.
 * This avoids painting cells outside the viewport, improving performance on large grids.
 * 
 * @param rows - Rows dimension object
 * @param cols - Columns dimension object
 * @param container - Scrollable container element
 * @returns Object with indices: visibleLeft, visibleRight, visibleTop, visibleBottom
 */
function calculateVisibleRegion(
    rows: Rows,
    cols: Cols,
    container: HTMLElement
) {
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const clientWidth = container.clientWidth;
    const clientHeight = container.clientHeight;

    // Find first visible column (left edge)
    let visibleLeft = 0, visibleRight = cols.n - 1;
    let x = 0;
    for (let c = 0; c < cols.n; c++) {
        if (x + cols.widths[c] > scrollLeft) {
            visibleLeft = c;
            break;
        }
        x += cols.widths[c];
    }
    // Find last visible column (right edge)
    x = 0;
    for (let c = 0; c < cols.n; c++) {
        x += cols.widths[c];
        if (x > scrollLeft + clientWidth) {
            visibleRight = c;
            break;
        }
    }

    // Find first visible row (top edge)
    let visibleTop = 0, visibleBottom = rows.n - 1;
    let y = 0;
    for (let r = 0; r < rows.n; r++) {
        if (y + rows.heights[r] > scrollTop) {
            visibleTop = r;
            break;
        }
        y += rows.heights[r];
    }
    // Find last visible row (bottom edge)
    y = 0;
    for (let r = 0; r < rows.n; r++) {
        y += rows.heights[r];
        if (y > scrollTop + clientHeight) {
            visibleBottom = r;
            break;
        }
    }

    return { visibleLeft, visibleRight, visibleTop, visibleBottom };
}

/**
 * Paints a selection block cell-by-cell, but only for cells within the visible region.
 * Also paints row and column headers if they are visible.
 * 
 * @param ctx - Canvas context
 * @param rows, cols - dimension objects
 * @param cellmanager - Provides cell values
 * @param container - Scrollable container element
 * @param selection - Selection range to paint
 * @param selectionarr - Array of multi-selection ranges (for header highlighting)
 * @param visible - Object with visible row/col indices
 */
function paintSelectionBlock(
    ctx: CanvasRenderingContext2D,
    rows: Rows,
    cols: Cols,
    cellmanager: CellManager,
    container: HTMLElement,
    selection: SelectionRange,
    selectionarr: SelectionRange[],
    visible: { visibleLeft: number; visibleRight: number; visibleTop: number; visibleBottom: number }
) {
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    // Paint all normal cells that are visible (main grid region)
    for (let r = Math.max(minRow, visible.visibleTop); r <= Math.min(maxRow, visible.visibleBottom); r++)
        for (let c = Math.max(minCol, visible.visibleLeft); c <= Math.min(maxCol, visible.visibleRight); c++) {
            // Get cell value; can be null if not loaded
            const cell = cellmanager.getCell(r, c);
            const value = cell ? cell.value : null;
            paintCell(ctx, container, rows, cols, r, c, value, selection, selectionarr);
        }

    // Paint row headers if visible (first column)
    for (let r = Math.max(minRow, visible.visibleTop); r <= Math.min(maxRow, visible.visibleBottom); r++)
        if (visible.visibleLeft === 0)
            paintCell(ctx, container, rows, cols, r, 0, r, selection, selectionarr);

    // Paint column headers if visible (first row)
    for (let c = Math.max(minCol, visible.visibleLeft); c <= Math.min(maxCol, visible.visibleRight); c++)
        if (visible.visibleTop === 0) {
            const columnLabel = getExcelColumnLabel(c - 1);
            paintCell(ctx, container, rows, cols, 0, c, columnLabel, selection, selectionarr);
        }
}

/**
 * Draws a rectangle overlay for a selection block, only for the visible part of the selection.
 * This rectangle visually outlines the selection block for the user
 * (useful for accessibility and keyboard navigation).
 * 
 * @param ctx - Canvas context
 * @param rows, cols - dimension objects
 * @param container - Scrollable container element
 * @param selection - Selection range for the rectangle
 * @param visible - Object with visible row/col indices
 * @param isActive - Whether this is the main selection (true) or a multi-selection (false)
 */
function paintSelectionRectangle(
    ctx: CanvasRenderingContext2D,
    rows: Rows,
    cols: Cols,
    container: HTMLElement,
    selection: SelectionRange,
    visible: { visibleLeft: number; visibleRight: number; visibleTop: number; visibleBottom: number },
    isActive: boolean // true for main selection, false for multi-selection
) {
    // Clamp selection rectangle to visible region
    const minRow = Math.max(Math.min(selection.startRow, selection.endRow), visible.visibleTop);
    const maxRow = Math.min(Math.max(selection.startRow, selection.endRow), visible.visibleBottom);
    const minCol = Math.max(Math.min(selection.startCol, selection.endCol), visible.visibleLeft);
    const maxCol = Math.min(Math.max(selection.startCol, selection.endCol), visible.visibleRight);

    // Compute top-left pixel of the rectangle
    let x = 0, y = 0;
    for (let i = 0; i < minCol; i++) x += cols.widths[i];
    for (let i = 0; i < minRow; i++) y += rows.heights[i];

    // Compute total width and height for the selection rectangle
    let w = 0, h = 0;
    for (let i = minCol; i <= maxCol; i++) w += cols.widths[i];
    for (let i = minRow; i <= maxRow; i++) h += rows.heights[i];

    // Adjust for scroll position
    const drawX = x - container.scrollLeft;
    const drawY = y - container.scrollTop;

    ctx.save();
    ctx.globalAlpha = 1;
    // Highlight color/border: do NOT change color, just draw the rectangle
    ctx.strokeStyle = "rgb(19,126,67)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(drawX, drawY, w, h);
    ctx.stroke();
    ctx.restore();
}

/**
 * Paints an individual cell or header cell.
 * Handles background, border, and text rendering based on selection and header state.
 * This logic is unchanged from your original code.
 * 
 * @param ctx - Canvas context
 * @param container - Scrollable container element
 * @param rows, cols - dimension objects
 * @param row, col - Cell coordinates
 * @param value - Cell value or header label
 * @param activeSelection - Current selection range
 * @param selectionarr - All multi-selections (for multi-selected header state)
 */
export function paintCell(
    ctx: CanvasRenderingContext2D,
    container: HTMLElement,
    rows: Rows,
    cols: Cols,
    row: number,
    col: number,
    value: string | number | null,
    activeSelection: SelectionRange,
    selectionarr: SelectionRange[]
) {
    
    const w = cols.widths[col];
    const h = rows.heights[row];

    // Calculate pixel position in canvas (with scroll offset)
    let drawX: number, drawY: number;
    drawX = calculateDrawX(row, col, cols, container);
    drawY = calculateDrawY(row, col, rows, container);
    

    // Selection and header logic
    const isHeader = row === 0 || col === 0;
    const isMultiSelectedHeader = isHeaderSelectedByAnySelection(row, col, selectionarr);

    const minRow = Math.min(activeSelection.startRow, activeSelection.endRow);
    const maxRow = Math.max(activeSelection.startRow, activeSelection.endRow);
    const minCol = Math.min(activeSelection.startCol, activeSelection.endCol);
    const maxCol = Math.max(activeSelection.startCol, activeSelection.endCol);

    const selectionStartedFromRowHeader = activeSelection.startCol === 0;
    const selectionStartedFromColHeader = activeSelection.startRow === 0;

    const isSelectedColumnHeader =
        row === 0 && col > 0 && selectionStartedFromColHeader &&
        col >= minCol && col <= maxCol;

    const isSelectedRowHeader =
        col === 0 && row > 0 && selectionStartedFromRowHeader &&
        row >= minRow && row <= maxRow;

    const isHighlightedColumnHeader =
        row === 0 && col > 0 &&
        col >= minCol && col <= maxCol &&
        !selectionStartedFromColHeader;

    const isHighlightedRowHeader =
        col === 0 && row > 0 &&
        row >= minRow && row <= maxRow &&
        !selectionStartedFromRowHeader;

    // ---- DRAWING CELL BACKGROUND ----
    ctx.clearRect(drawX, drawY, w, h);

    // Background color logic: unchanged (do not modify colors)
    if (isMultiSelectedHeader) {
        
        paintisMultiSelectedHeader(drawX, drawY, w, h, ctx);
    }
    else if (isSelectedColumnHeader || isSelectedRowHeader) {
       
        paintisSelectedHeader(drawX, drawY, w, h, ctx);
    }
    else if (isHighlightedColumnHeader || isHighlightedRowHeader) {
        
        paintisHighlitedHeder(drawX, drawY, w, h, ctx);
    }
    else if (isHeader) {
        
        paintisHeader(drawX, drawY, w, h, ctx);
    }
    else {
        ctx.fillStyle = "rgba(202,234,216,1)";
        ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
    }

    // ---- DRAWING CELL BORDERS ----
    ctx.strokeStyle = "#e0e0e0";
    ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);

    ctx.strokeStyle = "rgb(19, 126, 67)";
    ctx.lineWidth = 2;

    // Draw selection borders for edge cells
    if (!isHeader) {
        const isTopEdge = row === minRow;
        const isBottomEdge = row === maxRow;
        const isLeftEdge = col === minCol;
        const isRightEdge = col === maxCol;
        if (isTopEdge || isBottomEdge || isLeftEdge || isRightEdge) {
            ctx.beginPath();
            if (isTopEdge) { ctx.moveTo(drawX, drawY); ctx.lineTo(drawX + w, drawY); }
            if (isBottomEdge) { ctx.moveTo(drawX, drawY + h); ctx.lineTo(drawX + w, drawY + h); }
            if (isLeftEdge) { ctx.moveTo(drawX, drawY); ctx.lineTo(drawX, drawY + h); }
            if (isRightEdge) { ctx.moveTo(drawX + w, drawY); ctx.lineTo(drawX + w, drawY + h); }
            ctx.stroke();
        }
    }
    // Header borders (bottom for col headers, right for row headers)
    if (isSelectedColumnHeader || isHighlightedColumnHeader) {
        ctx.beginPath();
        ctx.moveTo(drawX + 0.5, drawY + h - 0.5);
        ctx.lineTo(drawX + w - 0.5, drawY + h - 0.5);
        ctx.stroke();
    }
    if (isSelectedRowHeader || isHighlightedRowHeader) {
        ctx.beginPath();
        ctx.moveTo(drawX + w - 0.5, drawY + 0.5);
        ctx.lineTo(drawX + w - 0.5, drawY + h - 0.5);
        ctx.stroke();
    }
    ctx.lineWidth = 1;

    // ---- DRAWING TEXT ----
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = (isSelectedColumnHeader || isSelectedRowHeader) ? "#FFFFFF" : "#000";
    ctx.font = "12px Arial";
    ctx.fillText(
        value != null ? String(value) : "",
        drawX + w / 2,
        drawY + h / 2
    );
}

/**
 * Helper for multi-selected header highlighting.
 * Returns true if this cell is a header and selected by any selection in selectionarr.
 * Used to highlight headers for multi-selection.
 * 
 * @param row, col - cell coordinates
 * @param selectionarr - array of selection ranges
 */
function isHeaderSelectedByAnySelection(row: number, col: number, selectionarr: SelectionRange[]): boolean {
    if (row === 0 && col > 0) {
        // Column header: check if any selection started from header and includes this column
        return selectionarr.some(sel =>
            sel.startRow === 0 &&
            col >= Math.min(sel.startCol, sel.endCol) &&
            col <= Math.max(sel.startCol, sel.endCol)
        );
    } else if (col === 0 && row > 0) {
        // Row header: check if any selection started from header and includes this row
        return selectionarr.some(sel =>
            sel.startCol === 0 &&
            row >= Math.min(sel.startRow, sel.endRow) &&
            row <= Math.max(sel.startRow, sel.endRow)
        );
    }
    return false;



    
}

export function paintisMultiSelectedHeader(drawX:number, drawY:number, w:number, h:number,ctx : CanvasRenderingContext2D) {
        
        ctx.fillStyle = "#0a753a";
        ctx.fillRect(drawX, drawY, w, h);
    }

export function paintisSelectedHeader(drawX:number, drawY:number, w:number, h:number,ctx : CanvasRenderingContext2D){
        ctx.fillStyle = "#0a753a";
        ctx.fillRect(drawX, drawY, w, h);
    }

export function paintisHighlitedHeder(drawX:number, drawY:number, w:number, h:number,ctx : CanvasRenderingContext2D){
        ctx.fillStyle = "rgba(202,234,216,1)";
        ctx.fillRect(drawX, drawY, w, h);
    }

export function paintisHeader(drawX:number, drawY:number, w:number, h:number,ctx : CanvasRenderingContext2D){
        ctx.fillStyle = "rgba(245,245,245,1)";
        ctx.fillRect(drawX, drawY, w, h);
    }

/**
 * Calculates the drawX coordinate for a cell, given its row, col, and scroll position.
 * Also calculates the x offset by summing column widths.
 */
export function calculateDrawX(row: number, col: number, cols: Cols, container: HTMLElement): number {
    let x = 0;
    for (let i = 0; i < col; i++) {
        x += cols.widths[i];
    }
    if (row === 0 && col === 0) {
        return 0;
    } else if (row === 0) {
        return x - container.scrollLeft;
    } else if (col === 0) {
        return 0;
    } else {
        return x - container.scrollLeft;
    }
}

/**
 * Calculates the drawY coordinate for a cell, given its row, col, and scroll position.
 * Also calculates the y offset by summing row heights.
 */
export function calculateDrawY(row: number, col: number, rows: Rows, container: HTMLElement): number {
    let y = 0;
    for (let i = 0; i < row; i++) {
        y += rows.heights[i];
    }
    if (row === 0 && col === 0) {
        return 0;
    } else if (row === 0) {
        return 0;
    } else if (col === 0) {
        return y - container.scrollTop;
    } else {
        return y - container.scrollTop;
    }
}

export function drawFixedRowHeader(row: number, col:number, rows: Rows, cols: Cols,container: HTMLElement, ctx: CanvasRenderingContext2D, selectionarr: SelectionRange[], activeSelection: SelectionRange) {
    const w = cols.widths[col];
    const h = rows.heights[row];
    let drawX: number, drawY: number;
    drawX = calculateDrawX(row, col, cols, container);
    drawY = calculateDrawY(row, col, rows, container);
    // Selection and header logic
    const isHeader = row === 0 || col === 0;
    const isMultiSelectedHeader = isHeaderSelectedByAnySelection(row, col, selectionarr);
    const minRow = Math.min(activeSelection.startRow, activeSelection.endRow);
    const maxRow = Math.max(activeSelection.startRow, activeSelection.endRow);
    const minCol = Math.min(activeSelection.startCol, activeSelection.endCol);
    const maxCol = Math.max(activeSelection.startCol, activeSelection.endCol);

    const selectionStartedFromRowHeader = activeSelection.startCol === 0;
    const selectionStartedFromColHeader = activeSelection.startRow === 0;

    const isSelectedColumnHeader =
        row === 0 && col > 0 && selectionStartedFromColHeader &&
        col >= minCol && col <= maxCol;

    const isSelectedRowHeader =
        col === 0 && row > 0 && selectionStartedFromRowHeader &&
        row >= minRow && row <= maxRow;

    const isHighlightedColumnHeader =
        row === 0 && col > 0 &&
        col >= minCol && col <= maxCol &&
        !selectionStartedFromColHeader;

    const isHighlightedRowHeader =
        col === 0 && row > 0 &&
        row >= minRow && row <= maxRow &&
        !selectionStartedFromRowHeader;

    // Background color logic: unchanged (do not modify colors)
        if (isMultiSelectedHeader) {
            
            paintisMultiSelectedHeader(drawX, drawY, w, h, ctx);
        }
        else if (isSelectedColumnHeader || isSelectedRowHeader) {
           
            paintisSelectedHeader(drawX, drawY, w, h, ctx);
        }
        else if (isHighlightedColumnHeader || isHighlightedRowHeader) {
            
            paintisHighlitedHeder(drawX, drawY, w, h, ctx);
        }
        else if (isHeader) {
            
            paintisHeader(drawX, drawY, w, h, ctx);
        }
        else {
            ctx.fillStyle = "rgba(245,245,245,0.95)";
            ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
        }
    
    ctx.strokeStyle = "#e0e0e0";
    ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(row), drawX + w / 2, drawY + h / 2);
  }

/** Modular function: Draw all row headers in visible range */
export function  drawVisibleRowHeaders(startRow: number, endRow: number, rows: Rows, cols: Cols, container: HTMLElement, ctx: CanvasRenderingContext2D, selectionarr: SelectionRange[], selection: SelectionRange) {
    for (let row = startRow; row <= endRow; row++) {
      if (row === 0) continue;
      drawFixedRowHeader(row, 0, rows, cols, container, ctx,
                    selectionarr, selection);
    }
  }

  // --- Draw One Fixed Column Header ---
export function drawFixedColumnHeader(row: number, col: number, rows: Rows, cols: Cols, container: HTMLElement, ctx: CanvasRenderingContext2D, selectionarr: SelectionRange[], activeSelection: SelectionRange) {
    const w = cols.widths[col];
    const h = rows.heights[row];
    let drawX: number, drawY: number;
    drawX = calculateDrawX(row, col, cols, container);
    drawY = calculateDrawY(row, col, rows, container);

    // Selection and header logic
    const isHeader = row === 0 || col === 0;
    const isMultiSelectedHeader = isHeaderSelectedByAnySelection(row, col, selectionarr);

    const minRow = Math.min(activeSelection.startRow, activeSelection.endRow);
    const maxRow = Math.max(activeSelection.startRow, activeSelection.endRow);
    const minCol = Math.min(activeSelection.startCol, activeSelection.endCol);
    const maxCol = Math.max(activeSelection.startCol, activeSelection.endCol);

    const selectionStartedFromRowHeader = activeSelection.startCol === 0;
    const selectionStartedFromColHeader = activeSelection.startRow === 0;

    const isSelectedColumnHeader =
        row === 0 && col > 0 && selectionStartedFromColHeader &&
        col >= minCol && col <= maxCol;

    const isSelectedRowHeader =
        col === 0 && row > 0 && selectionStartedFromRowHeader &&
        row >= minRow && row <= maxRow;

    const isHighlightedColumnHeader =
        row === 0 && col > 0 &&
        col >= minCol && col <= maxCol &&
        !selectionStartedFromColHeader;

    const isHighlightedRowHeader =
        col === 0 && row > 0 &&
        row >= minRow && row <= maxRow &&
        !selectionStartedFromRowHeader;

    // Background color logic
    if (isMultiSelectedHeader) {
        paintisMultiSelectedHeader(drawX, drawY, w, h, ctx);
    } else if (isSelectedColumnHeader || isSelectedRowHeader) {
        paintisSelectedHeader(drawX, drawY, w, h, ctx);
    } else if (isHighlightedColumnHeader || isHighlightedRowHeader) {
        paintisHighlitedHeder(drawX, drawY, w, h, ctx);
    } else if (isHeader) {
        paintisHeader(drawX, drawY, w, h, ctx);
    } else {
        ctx.fillStyle = "rgba(245,245,245,0.95)";
        ctx.fillRect(drawX + 0.5, drawY + 0.5, w - 1, h - 1);
    }

    ctx.strokeStyle = "#e0e0e0";
    ctx.strokeRect(drawX + 0.5, drawY + 0.5, w, h);
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(col), drawX + w / 2, drawY + h / 2);
}

/** Modular function: Draw all column headers in visible range */
export function drawVisibleColumnHeaders(startCol: number, endCol: number, rows: Rows, cols: Cols, container: HTMLElement, ctx: CanvasRenderingContext2D, selectionarr: SelectionRange[], selection: SelectionRange) {
    for (let col = startCol; col <= endCol; col++) {
        if (col === 0) continue;
        drawFixedColumnHeader(0, col, rows, cols, container, ctx, selectionarr, selection);
    }
}