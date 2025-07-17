import { findIndexFromCoord } from "./utils.js";
import { Painter } from "./paint.js";
export class ColumnSelectionManager {
    constructor(griddrawer, rows, cols, cellmanager, canvas, statistics = null, scrollRefresh = null) {
        this.statistics = null;
        this.eventmanager = null;
        this.scrollRefresh = null;
        this.selectionarr = [];
        this.selection = null;
        this.dragStartCol = null;
        this.mouseMoveHandler = null;
        this.autoScrollInterval = null;
        this.lastX = 0;
        this.lastY = 0;
        this.container = document.querySelector('.container');
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics;
        this.scrollRefresh = scrollRefresh;
        this.listenSelectionChange();
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
        const event = new CustomEvent('selection-changed', {
            detail: { selection, selectionarr }
        });
        window.dispatchEvent(event);
    }
    hittest(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log(x);
        console.log(y);
        return y < this.rows.heights[0] && x > this.cols.widths[0];
    }
    handlePointerDown(event) {
        console.log('colselection handlePointerDown');
        this.startAutoScroll();
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (y < this.rows.heights[0] && x > this.cols.widths[0]) {
            const virtualX = x + this.container.scrollLeft;
            const col = findIndexFromCoord(virtualX, this.cols.widths);
            if (event.ctrlKey) {
                const colSelection = {
                    startRow: 0,
                    startCol: col,
                    endRow: this.rows.n - 1,
                    endCol: col
                };
                this.selectionarr.push(colSelection);
            }
            else if (!event.ctrlKey && this.selectionarr.length > 0) {
                this.selectionarr = [];
            }
            this.selection = {
                startRow: 0,
                startCol: col,
                endRow: this.rows.n - 1,
                endCol: col
            };
            this.dragStartCol = col;
            console.log(col);
            this.mouseMoveHandler = (moveEvent) => this.handlePointerMove(moveEvent);
            this.container.addEventListener('pointermove', this.mouseMoveHandler);
            Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
            this.dispatchSelectionChangeEvent(this.selection, this.selectionarr);
        }
    }
    handlePointerMove(event) {
        requestAnimationFrame(() => {
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const virtualX = x + this.container.scrollLeft;
            const currentCol = findIndexFromCoord(virtualX, this.cols.widths);
            console.log(`Current column: ${currentCol}, Drag start column: ${this.dragStartCol}`);
            if (this.selection && this.dragStartCol !== null) {
                this.selection.endCol = currentCol;
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
        if (this.selection) {
            this.selectionarr.push(this.selection);
            this.dispatchSelectionChangeEvent(this.selection, this.selectionarr);
        }
        console.log(this.selection);
        console.log(this.selectionarr);
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
