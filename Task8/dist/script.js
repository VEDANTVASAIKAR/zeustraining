"use strict";
/**
 * Represents a single cell in the grid.
 */
class Cell {
    /**
     * Initializes a Cell object.
     * @param x - X position of the cell
     * @param y - Y position of the cell
     * @param width - Width of the cell
     * @param height - Height of the cell
     * @param data - Initial content of the cell (optional)
     */
    constructor(x, y, width, height, data = "") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.data = data;
    }
    /**
     * Draws the cell on the given canvas context.
     * Optionally draws resize handles.
     * @param ctx - The canvas 2D rendering context
     * @param showRightHandle - Whether to show the right resize handle
     * @param showBottomHandle - Whether to show the bottom resize handle
     */
    draw(ctx, showRightHandle = false, showBottomHandle = false) {
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 0.4;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";
        let ellipse = this.data;
        let i = 0;
        // Ellipse text if too long for the cell
        if (ctx.measureText(this.data).width > this.width) {
            ellipse = '';
            while (ctx.measureText(ellipse).width < (this.width - 8) && i < this.data.length) {
                ellipse += this.data[i];
                i++;
            }
        }
        ctx.fillText(ellipse, this.x + 4, this.y + this.height / 2);
        ctx.save();
        // Draw the right resize handle if requested
        if (showRightHandle) {
            ctx.fillStyle = "#1976d2";
            ctx.fillRect(this.x + this.width - 5, this.y + this.height / 2 - 7, 6, 14);
        }
        // Draw the bottom resize handle if requested
        if (showBottomHandle) {
            ctx.fillStyle = "#388e3c";
            ctx.fillRect(this.x + this.width / 2 - 7, this.y + this.height - 5, 14, 6);
        }
        ctx.restore();
    }
    /**
     * Checks if the mouse is near the right or bottom edge (resize area).
     * @param mouseX - X coordinate of the mouse relative to the canvas
     * @param mouseY - Y coordinate of the mouse relative to the canvas
     * @param tolerance - Pixel tolerance to detect edge (default 5px)
     * @returns "right"|"bottom"|null
     */
    getResizeEdge(mouseX, mouseY, tolerance = 5) {
        if (mouseX > this.x + this.width - tolerance &&
            mouseX < this.x + this.width + tolerance &&
            mouseY > this.y && mouseY < this.y + this.height) {
            return "right";
        }
        if (mouseY > this.y + this.height - tolerance &&
            mouseY < this.y + this.height + tolerance &&
            mouseX > this.x && mouseX < this.x + this.width) {
            return "bottom";
        }
        return null;
    }
}
/**
 * Manages the grid of cells and canvas interactions.
 */
class GridDrawer {
    /**
     * Initializes the GridDrawer object.
     * @param canvasId - The ID of the canvas element
     * @param rows - Number of rows in the grid
     * @param cols - Number of columns in the grid
     * @param cellWidth - Width of each cell
     * @param cellHeight - Height of each cell
     */
    constructor(canvasId, rows = 50, cols = 20, cellWidth = 100, cellHeight = 30) {
        this.selectedRow = 0; // Currently selected row index
        this.selectedCol = 0; // Currently selected column index
        // Resizing state
        this.resizing = false; // Is a resize currently in progress
        this.resizeRow = -1; // Row index of the cell being resized
        this.resizeCol = -1; // Column index of the cell being resized
        this.resizeEdge = null; // Which edge is being resized
        this.startX = 0; // X position where resize started
        this.startY = 0; // Y position where resize started
        this.startWidth = 0; // Width of cell at start of resize
        this.startHeight = 0; // Height of cell at start of resize
        // For showing handles only on hover
        this.hoveredResizeRow = -1;
        this.hoveredResizeCol = -1;
        this.hoveredResizeEdge = null;
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found.`);
        }
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get 2D context from canvas.");
        }
        this.canvas = canvas;
        this.ctx = context;
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        // Set initial canvas size
        this.canvas.width = this.cols * this.cellWidth;
        this.canvas.height = this.rows * this.cellHeight;
        this.cells = [];
        this.initializeCells();
        this.attachEvents();
    }
    /**
     * Initializes the grid with Cell objects.
     */
    initializeCells() {
        for (let row = 0; row < this.rows; row++) {
            const rowCells = [];
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.cellWidth;
                const y = row * this.cellHeight;
                rowCells.push(new Cell(x, y, this.cellWidth, this.cellHeight));
            }
            this.cells.push(rowCells);
        }
    }
    /**
     * Draws the entire grid on the canvas.
     * Shows resize handles if a cell edge is hovered.
     */
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let showRight = false, showBottom = false;
                if (row === this.hoveredResizeRow &&
                    col === this.hoveredResizeCol) {
                    showRight = this.hoveredResizeEdge === "right";
                    showBottom = this.hoveredResizeEdge === "bottom";
                }
                this.cells[row][col].draw(this.ctx, showRight, showBottom);
            }
        }
    }
    /**
     * Updates x or y positions of only the affected cells after resizing.
     */
    updateCellPositionsAfterResize() {
        // Only update affected cells
        if (this.resizeEdge === "right") {
            // Column resize: update x for columns to the right of resizeCol
            for (let row = 0; row < this.rows; row++) {
                for (let col = this.resizeCol + 1; col < this.cols; col++) {
                    this.cells[row][col].x = this.cells[row][col - 1].x + this.cells[row][col - 1].width;
                }
            }
        }
        if (this.resizeEdge === "bottom") {
            // Row resize: update y for rows below resizeRow
            for (let col = 0; col < this.cols; col++) {
                for (let row = this.resizeRow + 1; row < this.rows; row++) {
                    this.cells[row][col].y = this.cells[row - 1][col].y + this.cells[row - 1][col].height;
                }
            }
        }
    }
    /**
     * Attaches pointer and keyboard event listeners for resizing, editing, and navigation.
     */
    attachEvents() {
        const input = document.getElementById("cellInput");
        // Helper to compute pointer position relative to canvas
        const getPointerPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        // Used to avoid triggering edit after a resize
        let pointerWasResize = false;
        /**
         * Displays the input box over the specified cell for editing.
         * @param row - Row index of the cell
         * @param col - Column index of the cell
         */
        const showInput = (row, col) => {
            const cell = this.cells[row][col];
            input.style.left = `${cell.x}px`;
            input.style.top = `${cell.y}px`;
            input.style.width = `${cell.width}px`;
            input.style.height = `${cell.height}px`;
            input.value = cell.data;
            input.style.display = "block";
            input.focus();
            // Save cell data and hide input on blur
            input.onblur = () => {
                cell.data = input.value;
                input.style.display = "none";
                this.drawGrid();
            };
        };
        // Pointer down: check for resize handle or prepare for editing
        this.canvas.addEventListener("pointerdown", (e) => {
            const { x, y } = getPointerPos(e);
            let clickedResize = false;
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const edge = this.cells[row][col].getResizeEdge(x, y);
                    if (edge) {
                        // Start resizing
                        this.resizing = true;
                        this.resizeRow = row;
                        this.resizeCol = col;
                        this.resizeEdge = edge;
                        this.startX = x;
                        this.startY = y;
                        this.startWidth = this.cells[row][col].width;
                        this.startHeight = this.cells[row][col].height;
                        this.canvas.setPointerCapture(e.pointerId);
                        pointerWasResize = true;
                        clickedResize = true;
                        return;
                    }
                }
            }
            pointerWasResize = false; // Not resizing, so allow editing on pointerup
            // Find the cell under the mouse by checking each cell's bounds
            let found = false;
            for (let row = 0; row < this.rows && !found; row++) {
                for (let col = 0; col < this.cols && !found; col++) {
                    const cell = this.cells[row][col];
                    if (x >= cell.x &&
                        x < cell.x + cell.width &&
                        y >= cell.y &&
                        y < cell.y + cell.height) {
                        this.selectedRow = row;
                        this.selectedCol = col;
                        found = true;
                    }
                }
            }
        });
        // Pointer up: finish resizing, or start editing if not resizing
        this.canvas.addEventListener("pointerup", (e) => {
            if (this.resizing) {
                this.resizing = false;
                this.resizeRow = -1;
                this.resizeCol = -1;
                this.resizeEdge = null;
                this.canvas.releasePointerCapture(e.pointerId);
                this.canvas.style.cursor = "default";
                // Prevent edit after resize
                pointerWasResize = true;
                return;
            }
            // Only show input if not resizing
            if (!pointerWasResize) {
                // Show input for editing
                if (this.selectedRow < this.rows && this.selectedCol < this.cols) {
                    // Only show if not already open
                    if (input.style.display !== "block") {
                        showInput(this.selectedRow, this.selectedCol);
                    }
                }
            }
            pointerWasResize = false;
        });
        // Pointer move: resize cell if dragging a handle, or update handle hover state
        this.canvas.addEventListener("pointermove", (e) => {
            const { x, y } = getPointerPos(e);
            if (this.resizing) {
                // Resize logic
                if (this.resizeEdge === "right") {
                    const newWidth = Math.max(20, this.startWidth + (x - this.startX));
                    for (let r = 0; r < this.rows; r++) {
                        this.cells[r][this.resizeCol].width = newWidth;
                    }
                }
                else if (this.resizeEdge === "bottom") {
                    const newHeight = Math.max(15, this.startHeight + (y - this.startY));
                    for (let c = 0; c < this.cols; c++) {
                        this.cells[this.resizeRow][c].height = newHeight;
                    }
                }
                // --- Update x/y positions ONLY for affected cells ---
                this.updateCellPositionsAfterResize();
                // Redraw grid
                this.drawGrid();
                e.preventDefault();
                return;
            }
            // Handle hover state for resize handles
            let found = false;
            for (let row = 0; row < this.rows && !found; row++) {
                for (let col = 0; col < this.cols && !found; col++) {
                    const edge = this.cells[row][col].getResizeEdge(x, y);
                    if (edge) {
                        this.canvas.style.cursor = edge === "right" ? "ew-resize" : "ns-resize";
                        this.hoveredResizeRow = row;
                        this.hoveredResizeCol = col;
                        this.hoveredResizeEdge = edge;
                        found = true;
                    }
                }
            }
            if (!found) {
                this.canvas.style.cursor = "default";
                this.hoveredResizeRow = -1;
                this.hoveredResizeCol = -1;
                this.hoveredResizeEdge = null;
            }
            this.drawGrid();
        });
        // Keyboard navigation and editing
        document.addEventListener("keydown", (e) => {
            if (input.style.display === "block") {
                const currentCell = this.cells[this.selectedRow][this.selectedCol];
                currentCell.data = input.value;
                this.drawGrid();
                switch (e.key) {
                    case "ArrowUp":
                        if (this.selectedRow > 0)
                            this.selectedRow--;
                        break;
                    case "ArrowDown":
                        if (this.selectedRow < this.rows - 1)
                            this.selectedRow++;
                        break;
                    case "ArrowLeft":
                        if (this.selectedCol > 0)
                            this.selectedCol--;
                        break;
                    case "ArrowRight":
                        if (this.selectedCol < this.cols - 1)
                            this.selectedCol++;
                        break;
                    case "Enter":
                        if (this.selectedRow < this.rows - 1)
                            this.selectedRow++;
                        break;
                    default:
                        return;
                }
                e.preventDefault();
                showInput(this.selectedRow, this.selectedCol);
            }
        });
    }
}
// Initialize and draw the grid
const grid = new GridDrawer("canvas");
grid.drawGrid();
