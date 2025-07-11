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
 * This can be called independently for preview or always as part of paintSelectedCells.
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
    for (const sel of selectionarr) {
        paintSelectionBlock(ctx, rows, cols, cellmanager, container, sel, selectionarr);
    }
}

/**
 * Main entry: Paints multi-selection and active selection.
 * This should be called on every selection change event, with both selection and selectionarr.
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
        console.log(selection);
        console.log(selectionarr);
        
        if (!ctx) return;
        griddrawer.rendervisible(rows, cols);

        // Paint all multi-selections first
        paintMultiSelections(ctx, griddrawer, rows, cols, cellmanager, container, selectionarr);

        // Then paint the current/active selection (topmost)
        if (selection) {
            paintSelectionBlock(ctx, rows, cols, cellmanager, container, selection, selectionarr);
        }
    }
}

// Paint a block for a single selection
function paintSelectionBlock(
    ctx: CanvasRenderingContext2D,
    rows: Rows,
    cols: Cols,
    cellmanager: CellManager,
    container: HTMLElement,
    selection: SelectionRange,
    selectionarr: SelectionRange[]
) {
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    // Paint all normal cells
    for (let r = minRow; r <= maxRow; r++)
        for (let c = minCol; c <= maxCol; c++) {
            const cell = cellmanager.getCell(r, c);
            const value = cell ? cell.value : null;
            paintCell(ctx, container, rows, cols, r, c, value, selection, selectionarr);
        }

    // Paint row headers
    for (let r = minRow; r <= maxRow; r++)
        paintCell(ctx, container, rows, cols, r, 0, r, selection, selectionarr);

    // Paint column headers
    for (let c = minCol; c <= maxCol; c++) {
        const columnLabel = getExcelColumnLabel(c - 1);
        paintCell(ctx, container, rows, cols, 0, c, columnLabel, selection, selectionarr);
    }
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