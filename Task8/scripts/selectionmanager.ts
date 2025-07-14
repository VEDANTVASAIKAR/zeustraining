import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { findIndexFromCoord, getExcelColumnLabel } from "./utils.js";
import { CellManager } from "./cellmanager.js";
import { GridDrawer } from "./griddrawer.js";
import { EventManager } from "./eventmanager.js";
import { Cell } from "./cell.js";
import { Statistics } from "./statistics.js";
import { Commandpattern } from "./commandpattern.js";   
import { celleditcommand } from "./celleditcommand.js";

/**
 * Manages selection of cells and highlighting of corresponding headers
 */
export class selectionManager {
    private dragStartRow: number | null = null;
    private dragStartCol: number | null = null;
    griddrawer: GridDrawer;
    rows: Rows;
    cols: Cols;
    cellmanager: CellManager;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    container: HTMLElement;
    private mouseMoveHandler: ((event: PointerEvent) => void) | null = null;
    public eventmanager : EventManager | null= null;
    statistics : Statistics | null = null;
    commandpattern: Commandpattern ;

    //for auto scroll
    lastX = 0;
    lastY = 0;
    autoScrollInterval : null | number = null ;
    
    /** 
     * Tracks the current selection of cells as a rectangle
     */
    activeSelection: {
        startRow: number;
        startCol: number; 
        endRow: number;
        endCol: number;
    } | null = null;
    
    selectionarr : SelectionRange[] = [];
    cellInput: HTMLInputElement | null = null;
    
    // Track the previously selected row and column to clear their highlighting
    private previousSelectedRow: number | null = null;
    private previousSelectedCol: number | null = null;

    constructor(
        griddrawer: GridDrawer, 
        rows: Rows, 
        cols: Cols, 
        cellmanager: CellManager, 
        canvas: HTMLCanvasElement,
        statistics : Statistics | null = null,
        Commandpattern : Commandpattern 
    ) {
        this.container = document.querySelector('.container') as HTMLElement;
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics;
        this.cellInput = document.getElementById("cellInput") as HTMLInputElement;
        this.commandpattern = Commandpattern;
 
    }

    seteventmanager(em : EventManager){
        this.eventmanager = em;
    }



    startAutoScroll() {
        if(this.autoScrollInterval != null)return;
        this.autoScrollInterval = window.setInterval(() => this.autoScrollLogic(), 60); 
    }   

    stopAutoScroll() {
        if (this.autoScrollInterval !== null) {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
        }
    }

    autoScrollLogic() {

        // Don't proceed if the mouseMoveHandler has been removed
        if (!this.mouseMoveHandler) {
            return;
        }

        // Don't proceed if lastX/Y are reset (indicating pointer up)
        if (this.lastX === 0 && this.lastY === 0) {
            return;
        }
        // Store original scroll position to check if we actually scrolled
        const originalScrollLeft = this.container.scrollLeft;
        const originalScrollTop = this.container.scrollTop;
        
        // Your existing autoscroll logic
        const SCROLL_BUFFER_RIGHT = 50;
        const SCROLL_BUFFER_LEFT = 250;
        const SCROLL_BUFFER_BOTTOM = 2;
        const SCROLL_BUFFER_TOP = 100;

        const SCROLL_STEP = 20;

        const viewportLeft = this.container.scrollLeft;
        const viewportRight = viewportLeft + this.container.clientWidth;
        const viewportTop = this.container.scrollTop;
        const viewportBottom = viewportTop + this.container.clientHeight;

        // Right edge
        if (this.lastX + this.container.scrollLeft > viewportRight - SCROLL_BUFFER_RIGHT) {
            this.container.scrollLeft += SCROLL_STEP;
        }
        // Left edge
        else if (this.lastX < SCROLL_BUFFER_LEFT) {
            this.container.scrollLeft -= SCROLL_STEP;
        }

        // Bottom edge
        if (this.lastY + this.container.scrollTop -50 > viewportBottom - SCROLL_BUFFER_BOTTOM) {
            this.container.scrollTop += SCROLL_STEP;
        }
        // Top edge
        else if (this.lastY < SCROLL_BUFFER_TOP) {
            this.container.scrollTop -= SCROLL_STEP;
        }
        
        // Check if we actually scrolled
        const didScroll = (this.container.scrollLeft !== originalScrollLeft) || 
                        (this.container.scrollTop !== originalScrollTop);
        
        // Only trigger synthetic event if we actually scrolled AND have an active handler
        if (didScroll && this.mouseMoveHandler) {
            // Create a synthetic pointer event at the last known position
            const syntheticEvent = new PointerEvent('pointermove', {
                clientX: this.lastX,
                clientY: this.lastY,
                // Add basic required properties
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            // Call the mouseMoveHandler with this synthetic event
            this.mouseMoveHandler(syntheticEvent);
        }
    } 

   

}

interface SelectionRange {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
}