import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord } from "./utils.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";
import { EventManager } from "./eventmanager.js";
import { Statistics } from "./statistics.js";
import { Painter, SelectionRange } from "./paint.js";
import { ScrollRefresh } from "./scrollrefresh.js";

export class Cornercell {
    griddrawer: GridDrawer;
    rows: Rows;
    cols: Cols;
    cellmanager: CellManager;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    container: HTMLElement;
    statistics: Statistics | null = null;
    eventmanager: EventManager | null = null;

    selectionarr: SelectionRange[] = [];
    selection: SelectionRange | null = null;
    dragStartRow: number | null = null;
    mouseMoveHandler: ((event: PointerEvent) => void) | null = null;
    autoScrollInterval: null | number = null;
    scrollRefresh: ScrollRefresh | null = null;
    lastX = 0;
    lastY = 0;

    constructor(
        griddrawer: GridDrawer,
        rows: Rows,
        cols: Cols,
        cellmanager: CellManager,
        canvas: HTMLCanvasElement,
        statistics: Statistics | null = null,
        scrollRefresh: ScrollRefresh | null = null
    ) {
        this.container = document.querySelector('.container') as HTMLElement;
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics;
        this.listenSelectionChange();
        this.scrollRefresh = scrollRefresh;
    }

    seteventmanager(em: EventManager) {
        this.eventmanager = em;
    }

    listenSelectionChange() {
        window.addEventListener('selection-changed', (e: any) => {
            if (e.detail) {
                this.selection = e.detail.selection;
                this.selectionarr = e.detail.selectionarr;
                Painter.paintSelectedCells(
                    this.ctx!, this.griddrawer, this.rows, this.cols,
                    this.cellmanager, this.container, this.selection, this.selectionarr
                );
            }
        });
    }

    dispatchSelectionChangeEvent(selection: SelectionRange, selectionarr: SelectionRange[]) {
        const event = new CustomEvent('selection-changed', {
            detail: { selection, selectionarr }
        });
        window.dispatchEvent(event);
    }

    hittest(event: PointerEvent): boolean {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = findIndexFromCoord(x, this.cols.widths);
        const row = findIndexFromCoord(y, this.rows.heights)
        return row === 0 && col === 0;
    }

    handlePointerDown(event: PointerEvent) {
        console.log('corner handlePointerDown');
        
        this.startAutoScroll();
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = findIndexFromCoord(x, this.cols.widths);
        const row = findIndexFromCoord(y, this.rows.heights)
        this.selection = {
            startRow: row,
            startCol: col,
            endRow: this.rows.heights.length - 1,
            endCol: this.cols.widths.length - 1
        };
        this.selectionarr = [];

        if (this.selection){

            // Paint multi-selection and active selection
            Painter.paintSelectedCells(this.ctx!, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
            this.dispatchSelectionChangeEvent(this.selection,this.selectionarr);
        }
        
    }

    handlePointerMovee(event: PointerEvent) {
        // this.lastX = event.clientX;
        // this.lastY = event.clientY;
        // const rect = this.canvas.getBoundingClientRect();
        // const y = event.clientY - rect.top;
        // const virtualY = y + this.container.scrollTop;
        // const currentRow = findIndexFromCoord(virtualY, this.rows.heights);

        // if (this.selection && this.dragStartRow !== null && !event.ctrlKey) {
        //     this.selection.endRow = currentRow;
        //     this.dispatchSelectionChangeEvent(this.selection,this.selectionarr);
        //     // Paint multi-selection and active selection
        //     // Painter.paintSelectedCells(this.ctx!, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
        // }
    }

    handlePointerUp(event: PointerEvent) {
        // this.stopAutoScroll();
        // if (this.mouseMoveHandler) {
        //     this.container.removeEventListener('pointermove', this.mouseMoveHandler);
        //     this.mouseMoveHandler = null;
        // }
        // this.lastX = 0;
        // this.lastY = 0;
    }

    startAutoScroll() {
        if (this.autoScrollInterval != null) return;
        this.autoScrollInterval = window.setInterval(() => this.autoScrollLogic(), 60);
    }
    stopAutoScroll() {
        if (this.autoScrollInterval !== null) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
    autoScrollLogic() {
        if (!this.mouseMoveHandler) return;
        if (this.lastX === 0 && this.lastY === 0) return;
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