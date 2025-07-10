export class ResizeCols {
    constructor(
    /** Reference to the Cols object managing column widths */
    cols, rows, griddrawer, eventManager, selectionManager) {
        this.cols = cols;
        this.rows = rows;
        this.griddrawer = griddrawer;
        this.eventManager = eventManager;
        this.selectionManager = selectionManager;
        /** @type {number | null} The index of the column border currently hovered for resizing */
        this.hoveredColBorder = null;
        this.resizingCol = null; // Which column is being resized
        this.startX = 0; // Where the drag started (for calculations)
        this.startWidth = 0; // Initial width of the column
        this.resizingColLeft = null;
        /** Position of the preview line when resizing */
        this.previewLineX = null;
        this.selection = null;
        // Get the main canvas element
        this.canvas = document.getElementById("canvas");
        // Get the overlay canvas for temporary visual elements
        this.overlay = document.getElementById('overlay');
        //Get 2D rendering context
        const overlayCtx = this.overlay.getContext("2d");
        // Ensure we have valid contexts
        if (!overlayCtx)
            throw new Error("No 2D context");
        this.overlayCtx = overlayCtx;
        this.cols = cols;
        this.container = document.querySelector('.container');
        this.eventManager = eventManager;
        this.selectionManager = selectionManager;
        // Listen for selection changes
        this.canvas.addEventListener('selection-changed', (event) => {
            this.selection = event.detail.selection;
            // console.log(this.selection);
        });
    }
    /**
    * Draws a vertical preview line during column resizing
    * @param x - X-coordinate where to draw the line
    */
    drawPreviewLineOverlayCol(x) {
        // Clear the overlay canvas
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        // Begin drawing the dashed line
        this.overlayCtx.beginPath();
        this.overlayCtx.setLineDash([5, 5]); // Dashed line pattern
        this.overlayCtx.moveTo(x, 0);
        this.overlayCtx.lineTo(x, this.overlay.height);
        this.overlayCtx.strokeStyle = '#107c41';
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.stroke();
        this.overlayCtx.setLineDash([]); // Reset dash pattern
    }
    handlePointerDown(event) {
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
    }
    handlePointerMove(event) {
        if (this.resizingCol !== null && this.resizingColLeft !== null) {
            const dx = event.clientX - this.startX;
            const newWidth = Math.max(10, this.startWidth + dx);
            this.cols.setWidth(this.resizingCol, newWidth);
            this.griddrawer.columnheaders(this.rows, this.cols); // Redraw headers
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.previewLineX = this.resizingColLeft + newWidth;
            // console.log(this.previewLineX);
            // Only draw preview line on overlay
            const adjustedPreviewLineX = this.previewLineX - this.container.scrollLeft;
            this.griddrawer.drawPreviewLineOverlay(adjustedPreviewLineX);
        }
    }
    handlePointerUp(event) {
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
            this.griddrawer.ctx.clearRect(0, 0, this.griddrawer.canvas.width, this.griddrawer.canvas.height);
            //  Clear the overlay (removes preview line)
            this.griddrawer.clearOverlay();
            // Redraw everything
            this.griddrawer.rendervisible(this.rows, this.cols);
            // }
            if (this.selection) {
                this.selectionManager.paintSelectedCells(this.selection?.startRow, this.selection?.startCol, this.selection?.endRow, this.selection?.endCol);
                // this.selectionManager.selectMultipleColumns(this.selection?.startCol, this.selection?.endCol);
            }
            this.eventManager.updateInputBoxIfVisible();
        }
        // Reset the resizingCol state
        this.resizingCol = null;
        this.resizingColLeft = null;
        window.removeEventListener('pointermove', this.handlePointerMove.bind(this));
    }
    /**
     HIT TEST
     */
    hittest(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Calculate virtual coordinates with scroll offset
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;
        const threshold = 5; // px distance to detect border for resizing
        const headerHeight = this.rows.heights[0];
        const headerWidth = this.cols.widths[0];
        // --- Check for column resizing (hovering near right edge of any column in header row) ---
        if (y < headerHeight) {
            let sum = 0;
            for (let col = 0; col < this.cols.n; col++) {
                sum += this.cols.widths[col];
                // Using virtualX to account for scroll position
                if (Math.abs(virtualX - sum) < threshold) {
                    // this.canvas.style.cursor = "ew-resize";
                    this.hoveredColBorder = col;
                    return true;
                }
            }
        }
        return false;
    }
}
