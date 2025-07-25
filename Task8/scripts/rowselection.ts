import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord } from "./utils.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";
import { EventManager } from "./eventmanager.js";
import { Statistics } from "./statistics.js";
import { Painter, SelectionRange, paintCell } from "./paint.js";
import { ScrollRefresh } from "./scrollrefresh.js";

export class RowSelectionManager {
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
                // Painter.paintSelectedCells(
                //     this.ctx!, this.griddrawer, this.rows, this.cols,
                //     this.cellmanager, this.container, this.selection, this.selectionarr,e
                // );
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
        return x < this.cols.widths[0] && y > this.rows.heights[0];
    }

    handlePointerDown(event: PointerEvent) {
        console.log('rowselection handlePointerDown');
        
        this.startAutoScroll();
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < this.cols.widths[0] && y > this.rows.heights[0]) {
            const virtualY = y + this.container.scrollTop;
            const row = findIndexFromCoord(virtualY, this.rows.heights);
            const rowSelection = {
                    startRow: row,
                    startCol: 0,
                    endRow: row,
                    endCol: this.cols.n - 1
                };
            const exists = this.selectionarr.some(obj => obj.startRow == row && obj.startCol == 0 && obj.endRow == row && obj.endCol == this.cols.n - 1) 

            if (event.ctrlKey) {
                if (exists){
                    this.selectionarr = this.selectionarr.filter(
                    obj => !(obj.startRow == row && obj.startCol == 0 && obj.endRow == row &&
                    obj.endCol == this.cols.n - 1));
                }else {
                    this.selectionarr.push(rowSelection);
                }
                
                // console.log("Row selection array:", this.selectionarr);
                
            } else if (!event.ctrlKey && this.selectionarr.length > 0) {
                this.selectionarr = [];
            }

            
            if(rowSelection != this.selection && !exists){
                this.selection = {
                startRow: row,
                startCol: 0,
                endRow: row,
                endCol: this.cols.n - 1
                };
            }
            
            this.dragStartRow = row;
            this.mouseMoveHandler = (moveEvent) => this.handlePointerMove(moveEvent);
            this.container.addEventListener('pointermove', this.mouseMoveHandler);
            console.log(this.selectionarr);
            
            // Paint multi-selection and active selection
            Painter.paintSelectedCells(this.ctx!, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr,event);
            //cornercell
            paintCell(this.ctx!, this.container, this.rows, this.cols,
            0,0,null, this.selection!, this.selectionarr,event); 
        }
    }

    handlePointerMove(event: PointerEvent) {
        this.lastX = event.clientX;
        this.lastY = event.clientY;
        const rect = this.canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        const virtualY = y + this.container.scrollTop;
        const currentRow = findIndexFromCoord(virtualY, this.rows.heights);

        if (this.selection && this.dragStartRow !== null ) {
            this.selection.endRow = currentRow;
            this.dispatchSelectionChangeEvent(this.selection,this.selectionarr);
            // Paint multi-selection and active selection
            Painter.paintSelectedCells(this.ctx!, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr,event);
            //cornercell
            paintCell(this.ctx!, this.container, this.rows, this.cols,
                            0,0,null, this.selection!, this.selectionarr,event); 
        }
    }

    handlePointerUp(event: PointerEvent) {
        this.stopAutoScroll();
        if (this.mouseMoveHandler) {
            this.container.removeEventListener('pointermove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }
        
        console.log(this.selection);
        
        // const exists = this.selectionarr.some(obj => obj.startRow == this.selection?.startRow && obj.startCol == this.selection?.startCol && obj.endRow == this.selection?.endRow && obj.endCol == this.selection?.endCol) 
        // console.log(exists);
        
        // if (exists){
        //     this.selectionarr = this.selectionarr.filter(
        //     obj => !(obj.startRow == this.selection?.startRow && obj.startCol == this.selection?.startCol && obj.endRow == this.selection?.endRow && obj.endCol == this.selection?.endCol));
        // }else {
            if (this.selection) {
                this.selectionarr.push(this.selection);
                this.dispatchSelectionChangeEvent(this.selection,this.selectionarr);
                Painter.paintSelectedCells(this.ctx!, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.selection, this.selectionarr,event);
                //cornercell
                paintCell(this.ctx!, this.container, this.rows, this.cols,
                                0,0,null, this.selection!, this.selectionarr,event); 
            }
        // }
        
        this.lastX = 0;
        this.lastY = 0;
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