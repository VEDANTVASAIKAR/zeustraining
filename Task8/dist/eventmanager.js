import { findIndexFromCoord } from "./utils.js";
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
        // Initialize selection to cell A1 (row 1, col 1 since row 0 and col 0 are headers)
        this.selectedRow = 1;
        this.selectedCol = 1;
        this.container = document.querySelector('.container');
        this.attachCanvasEvents();
        this.attachInputEvents();
        this.redraw();
        this.attachMouseEvents();
        // Position the input in cell A1 immediately
        this.positionInputAtCurrentSelection();
        this.notifySelectionChange();
        this.canvas.focus();
    }
    redraw() {
        // Use requestAnimationFrame to throttle scroll events
        let ticking = false;
        // Initial render when the page loads
        this.grid.rendervisible(this.rows, this.cols);
        this.container.addEventListener('scroll', (e) => {
            // console.log("Scroll");
            // Check if input is visible (user is editing)
            const isEditing = this.cellInput.style.display === 'block';
            // Only update the input box if it's visible
            if (isEditing) {
                // console.log(`${this.cellInput.value}`);
                // console.log(this.selectedCol)
                // console.log(this.selectedRow)
                this.cellManager.setCell(this.selectedRow, this.selectedCol, this.cellInput.value);
            }
            // update input box position if visible
            if (this.cellInput.style.display == 'block') {
                this.updateInputBoxIfVisible();
            }
            // Only schedule a new rendering if we're not already in the middle of one
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // console.log("Rendering grid after scroll");
                    this.grid.rendervisible(this.rows, this.cols);
                    // After rendering is complete, reapply any current selection highlighting
                    if (this.selectionManager) {
                        this.selectionManager.reapplySelectionHighlighting();
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
        // Also re-render on window resize
        window.addEventListener('resize', () => {
            // console.log("Window resize detected");
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.grid.rendervisible(this.rows, this.cols);
                    // Also reapply selection highlighting after resize
                    if (this.selectionManager) {
                        this.selectionManager.reapplySelectionHighlighting();
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    attachCanvasEvents() {
        // this.canvas.addEventListener("pointerdown", (event) => this.handleCanvasClick(event));
        this.canvas.addEventListener("dblclick", (event) => this.handledblClick(event));
    }
    attachInputEvents() {
        this.cellInput.addEventListener("blur", () => this.saveCell());
        this.cellInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.saveCell();
                // Move selection down after Enter (like Excel)
                if (this.selectedRow !== null) {
                    this.selectedRow++;
                    this.positionInputAtCurrentSelection();
                    // Notify SelectionManager about new selection
                    this.notifySelectionChange();
                }
                e.preventDefault();
            }
        });
        this.canvas.addEventListener("keydown", (e) => {
            // Check if a cell is selected
            if (this.selectedRow === null || this.selectedCol === null)
                return;
            let moved = false;
            switch (e.key) {
                case "ArrowUp":
                    if (this.selectedRow > 1) { // Don't go above row 1 (row 0 is header)
                        if (this.cellInput.style.display === "block") {
                            this.saveCell();
                        }
                        this.selectedRow--;
                        moved = true;
                    }
                    break;
                case "ArrowDown":
                    if (this.cellInput.style.display === "block") {
                        this.saveCell();
                    }
                    this.selectedRow++;
                    moved = true;
                    break;
                case "ArrowLeft":
                    if (this.selectedCol > 1) { // Don't go left of column 1 (column 0 is header)
                        if (this.cellInput.style.display === "block") {
                            this.saveCell();
                        }
                        this.selectedCol--;
                        moved = true;
                    }
                    break;
                case "ArrowRight":
                    if (this.cellInput.style.display === "block") {
                        this.saveCell();
                    }
                    this.selectedCol++;
                    moved = true;
                    break;
                default:
                    // Only focus and populate input on typing keys
                    if (e.key.length === 1 && // Single character keys (letters, numbers, symbols)
                        !e.ctrlKey &&
                        !e.altKey &&
                        !e.metaKey &&
                        e.key !== 'ArrowUp' &&
                        e.key !== 'ArrowRight' &&
                        e.key !== 'ArrowLeft' &&
                        e.key !== 'ArrowDown') {
                        // Focus the input
                        this.cellInput.focus();
                        // Prevent the key from also being added by the browser's default behavior
                        e.preventDefault();
                    }
            }
            // If moved with arrow keys, update the input position
            if (moved) {
                // CRITICAL: Hide the input during keyboard navigation
                this.cellInput.style.display = "none";
                // Update the input position (but keep it hidden)
                this.positionInputAtCurrentSelection();
                // Notify SelectionManager about the selection change
                this.notifySelectionChange();
                e.preventDefault();
            }
        });
    }
    /**
     * Notifies SelectionManager about changes to the selected cell
     */
    notifySelectionChange() {
        // Create a custom event with selection details
        const event = new CustomEvent('cell-selection-changed', {
            detail: {
                row: this.selectedRow,
                col: this.selectedCol
            }
        });
        // Dispatch the event on the canvas element
        this.canvas.dispatchEvent(event);
    }
    attachMouseEvents() {
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvas.addEventListener('keydown', (event) => this.handlekeydown(event));
        window.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        window.addEventListener('mousemove', (event) => this.handleMouseDrag(event));
    }
    handlekeydown(event) {
        // this.cellInput.focus();
    }
    handledblClick(event) {
        this.cellInput.focus();
    }
    handleMouseDown(event) {
        if (this.hoveredColBorder !== null) {
            this.resizingCol = this.hoveredColBorder;
            this.startX = event.clientX;
            this.startWidth = this.cols.widths[this.resizingCol];
            // Calculate initial preview line position
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.resizingColLeft = sum;
            this.previewLineX = sum + this.cols.widths[this.resizingCol];
        }
        if (this.hoveredRowBorder !== null) {
            this.resizingRow = this.hoveredRowBorder;
            this.startY = event.clientY;
            this.startHeight = this.rows.heights[this.resizingRow];
            // Calculate initial preview line position
            let sum = 0;
            for (let i = 0; i <= this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            this.previewLineY = sum;
        }
    }
    handleMouseDrag(event) {
        if (this.resizingCol !== null && this.resizingColLeft !== null) {
            const dx = event.clientX - this.startX;
            const newWidth = Math.max(10, this.startWidth + dx);
            this.cols.setWidth(this.resizingCol, newWidth);
            this.grid.columnheaders(this.rows, this.cols); // Redraw headers
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.previewLineX = this.resizingColLeft + newWidth;
            // console.log(this.previewLineX);
            // Only draw preview line on overlay
            const adjustedPreviewLineX = this.previewLineX - this.container.scrollLeft;
            this.grid.drawPreviewLineOverlay(adjustedPreviewLineX);
        }
        if (this.resizingRow !== null) {
            const dy = event.clientY - this.startY;
            const newHeight = Math.max(10, this.startHeight + dy);
            this.rows.setHeight(this.resizingRow, newHeight);
            this.grid.rowheaders(this.rows, this.cols); // Redraw headers
            let sum = 0;
            for (let i = 0; i < this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            this.previewLineY = sum + newHeight;
            // console.log(this.resizingRow);
            // Draw preview line horizontally on overlay
            const adjustedPreviewLineY = this.previewLineY - this.container.scrollTop;
            this.grid.drawPreviewLineOverlayRow(adjustedPreviewLineY);
        }
    }
    handleMouseUp(event) {
        // Only do this if a column is being resized and a preview line exists
        if (this.resizingCol !== null && this.previewLineX !== null && this.resizingColLeft !== null) {
            // Calculate the sum of all column widths before the one being resized
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            // The new width is the preview line position minus the sum of previous widths
            const finalWidth = this.previewLineX - this.resizingColLeft;
            // Update the width in the cols object
            this.cols.setWidth(this.resizingCol, finalWidth);
            // Disable the preview line
            this.grid.ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);
            //  Clear the overlay (removes preview line)
            this.grid.clearOverlay();
            // Redraw everything
            this.grid.rendervisible(this.rows, this.cols);
            //  ADD: Redraw all cell contents!
            // This will draw all cells with data after resizing.
            for (const [key, cell] of this.cellManager.cellMap.entries()) {
                this.grid.drawCell(cell.row, cell.col, cell.value, this.rows, this.cols);
            }
            this.updateInputBoxIfVisible();
        }
        // Reset the resizingCol state
        this.resizingCol = null;
        this.resizingColLeft = null;
        if (this.resizingRow !== null && this.previewLineY !== null) {
            let sum = 0;
            for (let i = 0; i < this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            const finalHeight = this.previewLineY - sum;
            this.rows.setHeight(this.resizingRow, finalHeight);
            this.grid.ctx.clearRect(0, 0, this.grid.canvas.width, this.grid.canvas.height);
            this.grid.clearOverlay();
            this.grid.rendervisible(this.rows, this.cols);
            for (const [key, cell] of this.cellManager.cellMap.entries()) {
                this.grid.drawCell(cell.row, cell.col, cell.value, this.rows, this.cols);
            }
            this.updateInputBoxIfVisible();
        }
        this.resizingRow = null;
    }
    // First, fix handleMouseMove to use virtual coordinates for detection
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
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
    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Add scroll offset to get position in the virtual grid
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const col = findIndexFromCoord(virtualX, this.cols.widths);
        const row = findIndexFromCoord(virtualY, this.rows.heights);
        // avoid editing headers
        if (row <= 0 || col <= 0)
            return;
        // Check if clicking on an already selected cell with visible input
        const isSameCell = (row === this.selectedRow && col === this.selectedCol);
        if (isSameCell && this.cellInput.style.display === "block") {
            // Prevent the browser's default focus behavior for the input
            event.preventDefault();
            event.stopPropagation();
            // Important: Explicitly keep focus on the canvas
            this.canvas.focus();
            return;
        }
        this.selectedRow = row;
        this.selectedCol = col;
        this.updateInputBoxIfVisible();
        this.notifySelectionChange();
        // Keep focus on the canvas instead of the input
        this.canvas.focus();
    }
    saveCell() {
        // Get current scroll position from container
        const scrollLeft = this.container.scrollLeft;
        const scrollTop = this.container.scrollTop;
        // console.log(this.cellInput.value.length);
        if (this.selectedRow !== null &&
            this.selectedCol !== null
        // this.cellInput.value !== ''
        ) {
            this.cellManager.setCell(this.selectedRow, this.selectedCol, this.cellInput.value);
            // Redraw only the edited cell:
            this.grid.drawCell(this.selectedRow, this.selectedCol, this.cellInput.value, this.rows, this.cols);
        }
        this.cellInput.style.display = "none";
    }
    /**
     * Updates the input box position and size if it's currently visible
     */
    updateInputBoxIfVisible() {
        if (this.selectedRow !== null && this.selectedCol !== null) {
            this.positionInputAtCurrentSelection();
        }
    }
    /**
     * Positions the input box at the currently selected cell
     * @param {boolean} makeVisible Whether to make the input visible (default: true)
     */
    positionInputAtCurrentSelection(makeVisible = true) {
        const cellLeft = this.cols.widths.slice(0, this.selectedCol).reduce((a, b) => a + b, 0);
        const cellTop = this.rows.heights.slice(0, this.selectedRow).reduce((a, b) => a + b, 0);
        // Log the absolute position in grid
        // console.log(`Cell absolute position: left=${cellLeft}, top=${cellTop}`);
        // console.log(`Current scroll: left=${this.container.scrollLeft}, top=${this.container.scrollTop}`);
        if (makeVisible) {
            this.cellInput.style.display = "block";
        }
        this.cellInput.style.position = "absolute";
        this.cellInput.style.left = cellLeft + "px";
        this.cellInput.style.top = cellTop + "px";
        this.cellInput.style.width = this.cols.widths[this.selectedCol] + "px";
        this.cellInput.style.height = this.rows.heights[this.selectedRow] + "px";
        // Verify the style values after setting
        // console.log(`Input box style: left=${this.cellInput.style.left}, top=${this.cellInput.style.top}, width=${this.cellInput.style.width}, height=${this.cellInput.style.height}`);
        const cell = this.cellManager.getCell(this.selectedRow, this.selectedCol);
        this.cellInput.value = cell && cell.value != null ? String(cell.value) : "";
        // Add this - intercept clicks on the input element itself
        this.cellInput.addEventListener('mousedown', (e) => {
            // Check if it's not a double-click
            if (e.detail === 1) {
                e.preventDefault();
                e.stopPropagation();
                this.canvas.focus();
                return false;
            }
        }, { once: false });
    }
}
