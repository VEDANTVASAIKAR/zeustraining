import { findIndexFromCoord } from "./utils.js";
import { Painter } from "./paint.js";
import { celleditcommand } from "./celleditcommand.js";
export class CellSelectionManager {
    constructor(griddrawer, rows, cols, cellmanager, canvas, statistics = null, scrollRefresh = null, commandpattern, keyboardSelection = null) {
        this.statistics = null;
        this.eventmanager = null;
        this.selectionarr = [];
        this.selection = null;
        this.dragStartRow = null;
        this.dragStartCol = null;
        this.mouseMoveHandler = null;
        this.autoScrollInterval = null;
        this.lastX = 0;
        this.lastY = 0;
        this.scrollRefresh = null;
        this.cellInput = null;
        this.keyboardSelection = null;
        this.container = document.querySelector('.container');
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics;
        this.cellInput = document.getElementById("cellInput");
        this.scrollRefresh = scrollRefresh;
        this.listenSelectionChange();
        this.commandpattern = commandpattern;
        this.keyboardSelection = keyboardSelection;
        this.cellInput?.addEventListener("input", (e) => {
            if (this.selection?.startRow !== null && this.selection?.startCol !== null) {
                const currentValue = this.cellInput?.value;
                if (this.selection && currentValue) {
                    // this.cellmanager.setCell(
                    //     this.selection.startRow,
                    //     this.selection.startCol,
                    //     currentValue
                    // );
                }
            }
        });
    }
    seteventmanager(em) {
        this.eventmanager = em;
    }
    listenSelectionChange() {
        window.addEventListener('selection-changed', (e) => {
            if (e.detail) {
                this.selection = e.detail.selection;
                this.selectionarr = e.detail.selectionarr;
                Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
            }
        });
    }
    dispatchSelectionChangeEvent(selection, selectionarr) {
        console.log('idid');
        const event = new CustomEvent('selection-changed', {
            detail: { selection, selectionarr }
        });
        window.dispatchEvent(event);
    }
    hittest(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);
        return row >= 1 && col >= 1;
    }
    handlePointerDown(event) {
        console.log('cellselection handlePointerDown');
        if (this.selection && this.selection?.startRow !== null && this.selection?.startCol !== null) {
            let oldvalue = this.cellmanager.getCell(this.selection.startRow, this.selection.startCol)?.value || "";
            ;
            const currentValue = this.cellInput?.value;
            console.log('cellselection handlePointerDown currentValue:', currentValue);
            console.log('cellselection handlePointerDown oldvalue:', oldvalue);
            if (this.selection && currentValue && currentValue !== oldvalue) {
                // this.cellmanager.setCell(
                //     this.selection.startRow,
                //     this.selection.startCol,
                //     currentValue
                // );
                this.commandpattern?.execute(new celleditcommand(this.cellmanager, this.selection.startRow, this.selection.startCol, this.cellmanager.getCell(this.selection.startRow, this.selection.startCol)?.value || "", currentValue, this.griddrawer, this.cellInput, this.keyboardSelection));
            }
        }
        this.startAutoScroll();
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < this.cols.widths[0] || y < this.rows.heights[0])
            return;
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);
        if (row < 1 || col < 1)
            return;
        this.selection = {
            startRow: row,
            startCol: col,
            endRow: row,
            endCol: col
        };
        this.selectionarr = [];
        Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
        this.dragStartRow = row;
        this.dragStartCol = col;
        this.mouseMoveHandler = (event) => this.handlePointerMove(event);
        this.container.addEventListener('pointermove', this.mouseMoveHandler);
        this.dispatchSelectionChangeEvent(this.selection, this.selectionarr);
    }
    handlePointerMove(event) {
        requestAnimationFrame(() => {
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const virtualX = x + this.container.scrollLeft;
            const virtualY = y + this.container.scrollTop;
            const currentCol = findIndexFromCoord(virtualX, this.cols.widths);
            const currentRow = findIndexFromCoord(virtualY, this.rows.heights);
            if (this.selection && this.dragStartRow !== null && this.dragStartCol !== null) {
                this.selection.endRow = currentRow;
                this.selection.endCol = currentCol;
                this.dispatchSelectionChangeEvent(this.selection, this.selectionarr);
                Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
            }
        });
    }
    handlePointerUp(event) {
        this.stopAutoScroll();
        if (this.mouseMoveHandler) {
            this.container.removeEventListener('pointermove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }
        this.lastX = 0;
        this.lastY = 0;
    }
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
        if (!this.mouseMoveHandler)
            return;
        if (this.lastX === 0 && this.lastY === 0)
            return;
        const originalScrollLeft = this.container.scrollLeft;
        const originalScrollTop = this.container.scrollTop;
        const SCROLL_BUFFER_RIGHT = 50;
        const SCROLL_BUFFER_LEFT = 250;
        const SCROLL_BUFFER_BOTTOM = 2;
        const SCROLL_BUFFER_TOP = 100;
        const SCROLL_STEP = 20;
        const viewportLeft = this.container.scrollLeft;
        const viewportRight = viewportLeft + this.container.clientWidth;
        const viewportTop = this.container.scrollTop;
        const viewportBottom = viewportTop + this.container.clientHeight;
        if (this.lastX + this.container.scrollLeft > viewportRight - SCROLL_BUFFER_RIGHT) {
            this.container.scrollLeft += SCROLL_STEP;
        }
        else if (this.lastX < SCROLL_BUFFER_LEFT) {
            this.container.scrollLeft -= SCROLL_STEP;
        }
        if (this.lastY + this.container.scrollTop - 50 > viewportBottom - SCROLL_BUFFER_BOTTOM) {
            this.container.scrollTop += SCROLL_STEP;
        }
        else if (this.lastY < SCROLL_BUFFER_TOP) {
            this.container.scrollTop -= SCROLL_STEP;
        }
        const didScroll = (this.container.scrollLeft !== originalScrollLeft) ||
            (this.container.scrollTop !== originalScrollTop);
        if (didScroll && this.mouseMoveHandler) {
            const syntheticEvent = new PointerEvent('pointermove', {
                clientX: this.lastX,
                clientY: this.lastY,
                bubbles: true,
                cancelable: true,
                view: window
            });
            this.mouseMoveHandler(syntheticEvent);
        }
    }
}
