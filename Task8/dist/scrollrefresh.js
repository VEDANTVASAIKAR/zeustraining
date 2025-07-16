import { paintCell, drawVisibleColumnHeaders, drawVisibleRowHeaders, Painter } from "./paint.js";
/**
 * ScrollRefresh: listens to 'selection-changed' events and paints on scroll,
 * always using the latest selection and selectionarr from the dispatched event.
 *
 * The canvas element is passed and ctx is retrieved internally.
 */
export class ScrollRefresh {
    constructor(container, canvas, griddrawer, rows, cols, cellmanager) {
        this.selection = null;
        this.selectionarr = [];
        this.container = container;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.listenSelectionChange();
        // Attach the scroll event permanently
        this.container.addEventListener('scroll', () => {
            // console.log(this.selection, this.selectionarr);
            requestAnimationFrame(() => {
                const { startRow, endRow, startCol, endCol } = this.griddrawer.getVisibleRange(this.rows, this.cols);
                Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr);
                drawVisibleColumnHeaders(startCol, endCol, this.rows, this.cols, this.container, this.ctx, this.selectionarr, this.selection);
                drawVisibleRowHeaders(startRow, endRow, this.rows, this.cols, this.container, this.ctx, this.selectionarr, this.selection);
                //cornercell
                paintCell(this.ctx, this.container, this.rows, this.cols, 0, 0, null, this.selection, this.selectionarr);
            });
        });
    }
    listenSelectionChange() {
        window.addEventListener('selection-changed', (e) => {
            if (e.detail) {
                this.selection = e.detail.selection;
                this.selectionarr = e.detail.selectionarr;
            }
        });
    }
}
