/**
 * Manages selection of cells and highlighting of corresponding headers
 */
export class selectionManager {
    constructor(griddrawer, rows, cols, cellmanager, canvas, statistics = null, Commandpattern) {
        this.dragStartRow = null;
        this.dragStartCol = null;
        this.mouseMoveHandler = null;
        this.eventmanager = null;
        this.statistics = null;
        //for auto scroll
        this.lastX = 0;
        this.lastY = 0;
        this.autoScrollInterval = null;
        /**
         * Tracks the current selection of cells as a rectangle
         */
        this.activeSelection = null;
        this.selectionarr = [];
        this.cellInput = null;
        // Track the previously selected row and column to clear their highlighting
        this.previousSelectedRow = null;
        this.previousSelectedCol = null;
        this.container = document.querySelector('.container');
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics;
        this.cellInput = document.getElementById("cellInput");
        this.commandpattern = Commandpattern;
    }
    seteventmanager(em) {
        this.eventmanager = em;
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
        if (this.lastY + this.container.scrollTop - 50 > viewportBottom - SCROLL_BUFFER_BOTTOM) {
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
