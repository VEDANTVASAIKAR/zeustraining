/**
 * Manages all event listeners for the grid and input elements.
 */
export class EventManager {
    constructor(canvas, cellInput, rows, cols, grid, cellManager, selectionManager) {
        this.canvas = canvas;
        this.cellInput = cellInput;
        this.rows = rows;
        this.cols = cols;
        this.grid = grid;
        this.cellManager = cellManager;
        this.selectionManager = selectionManager;
        this.selection = null;
        /** @type {number | null} The index of the column border currently hovered for resizing */
        this.hoveredColBorder = null;
        /** @type {number | null} The index of the row border currently hovered for resizing */
        this.hoveredRowBorder = null;
        // Add in EventManager class
        this.resizingCol = null; // Which column is being resized
        this.resizingRow = null;
        this.startX = 0; // Where the drag started (for calculations)
        this.startWidth = 0; // Initial width of the column
        this.startY = 0;
        this.startHeight = 0;
        this.previewLineY = null;
        /** Position of the preview line when resizing */
        this.previewLineX = null;
        this.resizingColLeft = null;
        this.paint = false; // to paint while resizing
        // Initialize selection to cell A1 (row 1, col 1 since row 0 and col 0 are headers)
        // this.paint = false;
        this.selectedRow = this.selection?.startRow || 1;
        this.selectedCol = this.selection?.startCol || 1;
        this.container = document.querySelector('.container');
        this.canvas.focus();
    }
    attachCanvasEvents() {
        // this.canvas.addEventListener("pointerdown", (event) => this.handleCanvasClick(event));
        this.canvas.addEventListener("dblclick", (event) => this.handledblClick(event));
    }
    handledblClick(event) {
        // console.log('eventmanager: handledblClick');
        this.cellInput.focus();
    }
    // handleCanvasClick(event: PointerEvent) {
    //     const rect = this.canvas.getBoundingClientRect();
    //     const x = event.clientX - rect.left;
    //     const y = event.clientY - rect.top;
    //     // Add scroll offset to get position in the virtual grid
    //     const virtualX = x + this.container.scrollLeft;
    //     const virtualY = y + this.container.scrollTop;
    //     const col = findIndexFromCoord(virtualX, this.cols.widths);
    //     const row = findIndexFromCoord(virtualY, this.rows.heights);
    //     // avoid editing headers
    //     if (row <= 0 || col <= 0) return;
    //     // Check if clicking on an already selected cell with visible input
    //     const isSameCell = (row === this.selectedRow && col === this.selectedCol);
    //     if (isSameCell && this.cellInput.style.display === "block") {
    //         // Prevent the browser's default focus behavior for the input
    //         event.preventDefault();
    //         event.stopPropagation();
    //         // Important: Explicitly keep focus on the canvas
    //         this.canvas.focus();
    //         return;
    //     }
    //     this.selectedRow = row;
    //     this.selectedCol = col;
    //     // this.notifySelectionChange();
    //     // Keep focus on the canvas instead of the input
    //     this.canvas.focus();
    // }
    showresizehandles(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // console.log('x:', x, 'y:', y);
        // Calculate virtual coordinates with scroll offset
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const threshold = 5; // px distance to detect border for resizing
        const headerHeight = this.rows.heights[0];
        const headerWidth = this.cols.widths[0];
        // Track if we found a border (for cursor)
        let foundBorder = false;
        // --- Check for column resizing (hovering near right edge of any column in header row) ---
        if (y < headerHeight) {
            let sum = 0;
            for (let col = 0; col < this.cols.n; col++) {
                sum += this.cols.widths[col];
                // Using virtualX to account for scroll position
                if (Math.abs(virtualX - sum) < threshold) {
                    this.canvas.style.cursor = "ew-resize";
                    this.hoveredColBorder = col;
                    foundBorder = true;
                    break;
                }
            }
        }
        // --- Check for row resizing (hovering near bottom edge of any row in the header column) ---
        if (!foundBorder && x < headerWidth) {
            let sum = 0;
            for (let row = 0; row < this.rows.n; row++) {
                sum += this.rows.heights[row];
                // Using virtualY to account for scroll position
                if (Math.abs(virtualY - sum) < threshold) {
                    this.canvas.style.cursor = "ns-resize";
                    this.hoveredRowBorder = row;
                    foundBorder = true;
                    break;
                }
            }
        }
        // --- Default cursor if not on any border ---
        if (!foundBorder) {
            this.canvas.style.cursor = "cell";
            this.hoveredColBorder = null;
            this.hoveredRowBorder = null;
        }
    }
}
