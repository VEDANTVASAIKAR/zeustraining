"use strict";
/**
 * Represents a single cell in the grid.
 */
class Cell {
    constructor(x, y, width, height, data = "") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.data = data;
    }
    draw(ctx, showRightHandle = false, showBottomHandle = false) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";
        let ellipse = this.data;
        let i = 0;
        if (ctx.measureText(this.data).width > this.width) {
            ellipse = '';
            while (ctx.measureText(ellipse).width < (this.width - 8) && i < this.data.length) {
                ellipse += this.data[i];
                i++;
            }
        }
        ctx.fillText(ellipse, this.x + 4, this.y + this.height / 2);
        ctx.save();
        if (showRightHandle) {
            ctx.fillStyle = "#1976d2";
            ctx.fillRect(this.x + this.width - 5, this.y + this.height / 2 - 7, 6, 14);
        }
        if (showBottomHandle) {
            ctx.fillStyle = "#388e3c";
            ctx.fillRect(this.x + this.width / 2 - 7, this.y + this.height - 5, 14, 6);
        }
        ctx.restore();
    }
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
    constructor(canvasId, rows = 50, cols = 20, cellWidth = 100, cellHeight = 30) {
        this.selectedRow = 0;
        this.selectedCol = 0;
        this.resizing = false;
        this.resizeRow = -1;
        this.resizeCol = -1;
        this.resizeEdge = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
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
     * Shifts x positions of all columns to the right of the resized column,
     * and y positions of all rows below the resized row.
     * Should be called after resizing a column or row.
     */
    shiftColumnsAndRows() {
        // Shift all columns' x
        for (let row = 0; row < this.rows; row++) {
            let currX = 0;
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col].x = currX;
                currX += this.cells[row][col].width;
            }
        }
        // Shift all rows' y
        for (let col = 0; col < this.cols; col++) {
            let currY = 0;
            for (let row = 0; row < this.rows; row++) {
                this.cells[row][col].y = currY;
                currY += this.cells[row][col].height;
            }
        }
    }
    /**
     * Attaches pointer and keyboard event listeners.
     */
    attachEvents() {
        const input = document.getElementById("cellInput");
        const getPointerPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        let pointerWasResize = false;
        const showInput = (row, col) => {
            const cell = this.cells[row][col];
            input.style.left = `${cell.x}px`;
            input.style.top = `${cell.y}px`;
            input.style.width = `${cell.width}px`;
            input.style.height = `${cell.height}px`;
            input.value = cell.data;
            input.style.display = "block";
            input.focus();
            input.onblur = () => {
                cell.data = input.value;
                input.style.display = "none";
                this.drawGrid();
            };
        };
        this.canvas.addEventListener("pointerdown", (e) => {
            const { x, y } = getPointerPos(e);
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const edge = this.cells[row][col].getResizeEdge(x, y);
                    if (edge) {
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
                        return;
                    }
                }
            }
            pointerWasResize = false;
            this.selectedCol = Math.floor(x / this.cellWidth);
            this.selectedRow = Math.floor(y / this.cellHeight);
        });
        this.canvas.addEventListener("pointerup", (e) => {
            if (this.resizing) {
                this.resizing = false;
                this.resizeRow = -1;
                this.resizeCol = -1;
                this.resizeEdge = null;
                this.canvas.releasePointerCapture(e.pointerId);
                this.canvas.style.cursor = "default";
                pointerWasResize = true;
                return;
            }
            if (!pointerWasResize) {
                if (this.selectedRow < this.rows && this.selectedCol < this.cols) {
                    if (input.style.display !== "block") {
                        showInput(this.selectedRow, this.selectedCol);
                    }
                }
            }
            pointerWasResize = false;
        });
        this.canvas.addEventListener("pointermove", (e) => {
            const { x, y } = getPointerPos(e);
            if (this.resizing) {
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
                // Shift only the relevant columns and rows
                this.shiftColumnsAndRows();
                this.drawGrid();
                e.preventDefault();
                return;
            }
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
