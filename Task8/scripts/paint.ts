import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { getExcelColumnLabel } from "./utils.js";
import { CellManager } from "./cellmanager.js";

export interface SelectionRange {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}

/**
 * Paints all selections in selectionarr (multi-selection).
 * Only paints cells and headers that are in the visible region.
 * Also paints rectangle overlays for selection blocks.
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
    const visible = calculateVisibleRegion(rows, cols, container);
    for (const sel of selectionarr) {
        paintSelectionBlock(ctx, rows, cols, cellmanager, container, sel, selectionarr, visible);

        // Paint rectangle overlay for this block (transparent, on top of cells)
        paintSelectionRectangle(ctx, rows, cols, container, sel, visible, false);
    }
}

/**
 * Main entry: Paints multi-selection and active selection.
 * Only visible region is painted. Also paints rectangle overlays.
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
        griddrawer.rendervisible(rows, cols);

        const visible = calculateVisibleRegion(rows, cols, container);

        // Paint all multi-selections first
        for (const sel of selectionarr) {
            paintSelectionBlock(ctx, rows, cols, cellmanager, container, sel, selectionarr, visible);
            paintSelectionRectangle(ctx, rows, cols, container, sel, visible, false);
        }

        // Then paint the current/active selection (topmost)
        if (selection) {
            paintSelectionBlock(ctx, rows, cols, cellmanager, container, selection, selectionarr, visible);
            paintSelectionRectangle(ctx, rows, cols, container, selection, visible, true);
        }
    }
}

// Calculate visible region (row/col indices) from container scroll and size
function calculateVisibleRegion(
    rows: Rows,
    cols: Cols,
    container: HTMLElement
) {
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const clientWidth = container.clientWidth;
    const clientHeight = container.clientHeight;

    // Find first and last visible column
    let visibleLeft = 0, visibleRight = cols.n - 1;
    let x = 0;
    for (let c = 0; c < cols.n; c++) {
        if (x + cols.widths[c] > scrollLeft) {
            visibleLeft = c;
            break;
        }
        x += cols.widths[c];
    }
    x = 0;
    for (let c = 0; c < cols.n; c++) {
        x += cols.widths[c];
        if (x > scrollLeft + clientWidth) {
            visibleRight = c;
            break;
        }
    }

    // Find first and last visible row
    let visibleTop = 0, visibleBottom = rows.n - 1;
    let y = 0;
    for (let r = 0; r < rows.n; r++) {
        if (y + rows.heights[r] > scrollTop) {
            visibleTop = r;
            break;
        }
        y += rows.heights[r];
    }
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

// Paint a block for a single selection, only for visible region
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

    // Paint all normal cells that are visible
    for (let r = Math.max(minRow, visible.visibleTop); r <= Math.min(maxRow, visible.visibleBottom); r++)
        for (let c = Math.max(minCol, visible.visibleLeft); c <= Math.min(maxCol, visible.visibleRight); c++) {
            const cell = cellmanager.getCell(r, c);
            const value = cell ? cell.value : null;
            paintCell(ctx, container, rows, cols, r, c, value, selection, selectionarr);
        }

    // Paint row headers if visible
    for (let r = Math.max(minRow, visible.visibleTop); r <= Math.min(maxRow, visible.visibleBottom); r++)
        if (visible.visibleLeft === 0) paintCell(ctx, container, rows, cols, r, 0, r, selection, selectionarr);

    // Paint column headers if visible
    for (let c = Math.max(minCol, visible.visibleLeft); c <= Math.min(maxCol, visible.visibleRight); c++)
        if (visible.visibleTop === 0) {
            const columnLabel = getExcelColumnLabel(c - 1);
            paintCell(ctx, container, rows, cols, 0, c, columnLabel, selection, selectionarr);
        }
}

// Paints a rectangle overlay for a selection block, only in visible region
function paintSelectionRectangle(
    ctx: CanvasRenderingContext2D,
    rows: Rows,
    cols: Cols,
    container: HTMLElement,
    selection: SelectionRange,
    visible: { visibleLeft: number; visibleRight: number; visibleTop: number; visibleBottom: number },
    isActive: boolean // true for main selection, false for multi-selection
) {
    const minRow = Math.max(Math.min(selection.startRow, selection.endRow), visible.visibleTop);
    const maxRow = Math.min(Math.max(selection.startRow, selection.endRow), visible.visibleBottom);
    const minCol = Math.max(Math.min(selection.startCol, selection.endCol), visible.visibleLeft);
    const maxCol = Math.min(Math.max(selection.startCol, selection.endCol), visible.visibleRight);

    // Compute top-left pixel of the rectangle
    let x = 0, y = 0;
    for (let i = 0; i < minCol; i++) x += cols.widths[i];
    for (let i = 0; i < minRow; i++) y += rows.heights[i];

    // Compute width and height of the selection rectangle
    let w = 0, h = 0;
    for (let i = minCol; i <= maxCol; i++) w += cols.widths[i];
    for (let i = minRow; i <= maxRow; i++) h += rows.heights[i];

    // Adjust for scroll position
    const drawX = x - container.scrollLeft;
    const drawY = y - container.scrollTop;

    ctx.save();
    ctx.globalAlpha = isActive ? 1 : 1;
    ctx.strokeStyle = "rgb(19,126,67)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(drawX, drawY, w, h);
    ctx.stroke();
    ctx.restore();
}

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
    let x = 0;
    for (let i = 0; i < col; i++) x += cols.widths[i];
    let y = 0;
    for (let i = 0; i < row; i++) y += rows.heights[i];
    const w = cols.widths[col];
    const h = rows.heights[row];
    let drawX: number, drawY: number;
    if (row === 0 && col === 0) { drawX = 0; drawY = 0; }
    else if (row === 0) { drawX = x - container.scrollLeft; drawY = 0; }
    else if (col === 0) { drawX = 0; drawY = y - container.scrollTop; }
    else { drawX = x - container.scrollLeft; drawY = y - container.scrollTop; }

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

    if (isMultiSelectedHeader) {
        ctx.fillStyle = "#0a753a";
        ctx.fillRect(drawX, drawY, w, h);
    }
    else if (isSelectedColumnHeader || isSelectedRowHeader) {
        ctx.fillStyle = "#0a753a";
        ctx.fillRect(drawX, drawY, w, h);
    }
    else if (isHighlightedColumnHeader || isHighlightedRowHeader) {
        ctx.fillStyle = "rgba(202,234,216,1)";
        ctx.fillRect(drawX, drawY, w, h);
    }
    else if (isHeader) {
        ctx.fillStyle = "rgba(245,245,245,1)";
        ctx.fillRect(drawX, drawY, w, h);
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
    // Header borders
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
 * Helper for multi-selected header
 */
function isHeaderSelectedByAnySelection(row: number, col: number, selectionarr: SelectionRange[]): boolean {
    if (row === 0 && col > 0) {
        // Column header
        return selectionarr.some(sel =>
            sel.startRow === 0 &&
            col >= Math.min(sel.startCol, sel.endCol) &&
            col <= Math.max(sel.startCol, sel.endCol)
        );
    } else if (col === 0 && row > 0) {
        // Row header
        return selectionarr.some(sel =>
            sel.startCol === 0 &&
            row >= Math.min(sel.startRow, sel.endRow) &&
            row <= Math.max(sel.startRow, sel.endRow)
        );
    }
    return false;
}