import { Cell } from "./cell.js";
/**
 * Manages the grid of cells and canvas interactions, with headers.
 */
// Constants for Excel-like headers
const ROW_HEADER_WIDTH = 50;
const COL_HEADER_HEIGHT = 30;
// Helper to convert column index to Excel-like label (A, B, ..., Z, AA, AB, ...)
function toColumnLabel(n) {
    let label = '';
    while (n >= 0) {
        label = String.fromCharCode((n % 26) + 65) + label;
        n = Math.floor(n / 26) - 1;
    }
    return label;
}
export class GridDrawer {
    constructor(canvasId, rows = 50, cols = 20, cellWidth = 100, cellHeight = 30) {
        this.selectedRow = 0;
        this.selectedCol = 0;
        // Resizing state
        this.resizing = false;
        this.resizeRow = -1;
        this.resizeCol = -1;
        this.resizeEdge = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        // For showing handles only on hover
        this.hoveredResizeRow = -1;
        this.hoveredResizeCol = -1;
        this.hoveredResizeEdge = null;
        const canvas = document.getElementById(canvasId);
        if (!canvas)
            throw new Error(`Canvas with id "${canvasId}" not found.`);
        const context = canvas.getContext("2d");
        if (!context)
            throw new Error("Failed to get 2D context from canvas.");
        this.canvas = canvas;
        this.ctx = context;
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        // Set initial canvas size (include headers)
        this.canvas.width = ROW_HEADER_WIDTH + this.cols * this.cellWidth;
        this.canvas.height = COL_HEADER_HEIGHT + this.rows * this.cellHeight;
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
                const x = ROW_HEADER_WIDTH + col * this.cellWidth;
                const y = COL_HEADER_HEIGHT + row * this.cellHeight;
                rowCells.push(new Cell(x, y, this.cellWidth, this.cellHeight));
            }
            this.cells.push(rowCells);
        }
    }
    /**
     * Draws column and row headers.
     */
    drawHeaders() {
        // Column headers
        for (let col = 0; col < this.cols; col++) {
            const x = ROW_HEADER_WIDTH + this.cells[0][col].x - ROW_HEADER_WIDTH;
            const width = this.cells[0][col].width;
            this.ctx.fillStyle = "#f3f3f3";
            this.ctx.fillRect(x, 0, width, COL_HEADER_HEIGHT);
            this.ctx.strokeStyle = "#bbb";
            this.ctx.strokeRect(x, 0, width, COL_HEADER_HEIGHT);
            this.ctx.fillStyle = "#444";
            this.ctx.font = "bold 13px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(toColumnLabel(col), x + width / 2, COL_HEADER_HEIGHT / 2);
        }
        // Row headers
        for (let row = 0; row < this.rows; row++) {
            const y = COL_HEADER_HEIGHT + this.cells[row][0].y - COL_HEADER_HEIGHT;
            const height = this.cells[row][0].height;
            this.ctx.fillStyle = "#f3f3f3";
            this.ctx.fillRect(0, y, ROW_HEADER_WIDTH, height);
            this.ctx.strokeStyle = "#bbb";
            this.ctx.strokeRect(0, y, ROW_HEADER_WIDTH, height);
            this.ctx.fillStyle = "#444";
            this.ctx.font = "bold 13px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText((row + 1).toString(), ROW_HEADER_WIDTH / 2, y + height / 2);
        }
        // Top-left corner
        this.ctx.fillStyle = "#e0e0e0";
        this.ctx.fillRect(0, 0, ROW_HEADER_WIDTH, COL_HEADER_HEIGHT);
        this.ctx.strokeStyle = "#bbb";
        this.ctx.strokeRect(0, 0, ROW_HEADER_WIDTH, COL_HEADER_HEIGHT);
    }
    /**
     * Draws the entire grid with headers.
     */
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawHeaders();
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let showRight = false, showBottom = false;
                if (row === this.hoveredResizeRow && col === this.hoveredResizeCol) {
                    showRight = this.hoveredResizeEdge === "right";
                    showBottom = this.hoveredResizeEdge === "bottom";
                }
                this.cells[row][col].draw(this.ctx, showRight, showBottom);
            }
        }
    }
    /**
     * Updates x or y positions of only the affected cells after resizing.
     * Also updates header sizes accordingly.
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
        const getPointerPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        let pointerWasResize = false;
        /**
         * Displays the input box over the specified cell for editing.
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
            input.onblur = () => {
                cell.data = input.value;
                input.style.display = "none";
                this.drawGrid();
            };
        };
        // Pointer down: check for resize handle or prepare for editing
        this.canvas.addEventListener("pointerdown", (e) => {
            const { x, y } = getPointerPos(e);
            // If in header area, disable cell editing and allow resize of header sizes.
            if (x < ROW_HEADER_WIDTH && y < COL_HEADER_HEIGHT) {
                // Top-left corner: do nothing
                return;
            }
            if (y < COL_HEADER_HEIGHT) {
                // Column header area - resizing columns
                let headerCol = -1;
                let xCursor = ROW_HEADER_WIDTH;
                for (let col = 0; col < this.cols; col++) {
                    const cell = this.cells[0][col];
                    if (x > cell.x + cell.width - 5 &&
                        x < cell.x + cell.width + 5 &&
                        y > 0 &&
                        y < COL_HEADER_HEIGHT) {
                        headerCol = col;
                        break;
                    }
                }
                if (headerCol !== -1) {
                    this.resizing = true;
                    this.resizeRow = -1;
                    this.resizeCol = headerCol;
                    this.resizeEdge = "right";
                    this.startX = x;
                    this.startWidth = this.cells[0][headerCol].width;
                    this.canvas.setPointerCapture(e.pointerId);
                    pointerWasResize = true;
                    return;
                }
                return; // prevent cell selection in header
            }
            if (x < ROW_HEADER_WIDTH) {
                // Row header area - resizing rows
                let headerRow = -1;
                let yCursor = COL_HEADER_HEIGHT;
                for (let row = 0; row < this.rows; row++) {
                    const cell = this.cells[row][0];
                    if (y > cell.y + cell.height - 5 &&
                        y < cell.y + cell.height + 5 &&
                        x > 0 &&
                        x < ROW_HEADER_WIDTH) {
                        headerRow = row;
                        break;
                    }
                }
                if (headerRow !== -1) {
                    this.resizing = true;
                    this.resizeRow = headerRow;
                    this.resizeCol = -1;
                    this.resizeEdge = "bottom";
                    this.startY = y;
                    this.startHeight = this.cells[headerRow][0].height;
                    this.canvas.setPointerCapture(e.pointerId);
                    pointerWasResize = true;
                    return;
                }
                return; // prevent cell selection in header
            }
            // Check resize handles in grid cells
            let clickedResize = false;
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
                        clickedResize = true;
                        return;
                    }
                }
            }
            pointerWasResize = false;
            // Find cell under the mouse
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
        // Pointer move: resize cell/header if dragging a handle, or update handle hover state
        this.canvas.addEventListener("pointermove", (e) => {
            const { x, y } = getPointerPos(e);
            if (this.resizing) {
                // Resizing column by header
                if (this.resizeEdge === "right" && this.resizeCol !== -1) {
                    const newWidth = Math.max(20, this.startWidth + (x - this.startX));
                    for (let r = 0; r < this.rows; r++) {
                        this.cells[r][this.resizeCol].width = newWidth;
                    }
                }
                // Resizing row by header
                else if (this.resizeEdge === "bottom" && this.resizeRow !== -1) {
                    const newHeight = Math.max(15, this.startHeight + (y - this.startY));
                    for (let c = 0; c < this.cols; c++) {
                        this.cells[this.resizeRow][c].height = newHeight;
                    }
                }
                // Resizing normal grid cells
                else if (this.resizeEdge === "right" && this.resizeCol !== -1) {
                    const newWidth = Math.max(20, this.startWidth + (x - this.startX));
                    for (let r = 0; r < this.rows; r++) {
                        this.cells[r][this.resizeCol].width = newWidth;
                    }
                }
                else if (this.resizeEdge === "bottom" && this.resizeRow !== -1) {
                    const newHeight = Math.max(15, this.startHeight + (y - this.startY));
                    for (let c = 0; c < this.cols; c++) {
                        this.cells[this.resizeRow][c].height = newHeight;
                    }
                }
                this.updateCellPositionsAfterResize();
                this.drawGrid();
                e.preventDefault();
                return;
            }
            // Handle hover state for resize handles (cells only, not headers for now)
            let found = false;
            // Column header hover for resize
            if (y < COL_HEADER_HEIGHT && x > ROW_HEADER_WIDTH) {
                for (let col = 0; col < this.cols && !found; col++) {
                    const cell = this.cells[0][col];
                    if (x > cell.x + cell.width - 5 &&
                        x < cell.x + cell.width + 5 &&
                        y > 0 &&
                        y < COL_HEADER_HEIGHT) {
                        this.canvas.style.cursor = "ew-resize";
                        found = true;
                    }
                }
            }
            // Row header hover for resize
            else if (x < ROW_HEADER_WIDTH && y > COL_HEADER_HEIGHT) {
                for (let row = 0; row < this.rows && !found; row++) {
                    const cell = this.cells[row][0];
                    if (y > cell.y + cell.height - 5 &&
                        y < cell.y + cell.height + 5 &&
                        x > 0 &&
                        x < ROW_HEADER_WIDTH) {
                        this.canvas.style.cursor = "ns-resize";
                        found = true;
                    }
                }
            }
            else {
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
