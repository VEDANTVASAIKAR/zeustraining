import { Painter, SelectionRange } from "./paint.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";

/**
 * ScrollRefresh: listens to 'selection-changed' events and paints on scroll,
 * always using the latest selection and selectionarr from the dispatched event.
 * 
 * The canvas element is passed and ctx is retrieved internally.
 */
export class ScrollRefresh {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private griddrawer: GridDrawer;
    private rows: Rows;
    private cols: Cols;
    private cellmanager: CellManager;

    private selection: SelectionRange | null = null;
    private selectionarr: SelectionRange[] = [];

    constructor(
        container: HTMLElement,
        canvas: HTMLCanvasElement,
        griddrawer: GridDrawer,
        rows: Rows,
        cols: Cols,
        cellmanager: CellManager
    ) {
        this.container = container;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;

        this.listenSelectionChange();

        // Attach the scroll event permanently
        this.container.addEventListener('scroll', () => {
            console.log(this.selection, this.selectionarr);
            requestAnimationFrame(() => {
                Painter.paintSelectedCells(
                this.ctx,
                this.griddrawer,
                this.rows,
                this.cols,
                this.cellmanager,
                this.container,
                this.selection,
                this.selectionarr
                ); 
            });
            
        });
    }

    private listenSelectionChange() {
        window.addEventListener('selection-changed', (e: any) => {
            if (e.detail) {
                this.selection = e.detail.selection;
                this.selectionarr = e.detail.selectionarr;
            }
        });
    }
}