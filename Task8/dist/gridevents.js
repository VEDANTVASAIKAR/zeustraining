export class GridEvents {
    constructor(model, renderer, canvas, input) {
        // For resizing
        this.resizing = false;
        this.resizeRow = -1;
        this.resizeCol = -1;
        this.resizeEdge = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        // For hover handles
        this.hoveredResizeRow = -1;
        this.hoveredResizeCol = -1;
        this.hoveredResizeEdge = null;
        this.model = model;
        this.renderer = renderer;
        this.canvas = canvas;
        this.input = input;
        this.attach();
    }
    updateCellPositionsAfterResize() {
        if (this.resizeEdge === "right") {
            for (let row = 0; row < this.model.rows; row++) {
                for (let col = this.resizeCol + 1; col < this.model.cols; col++) {
                    this.model.cells[row][col].x = this.model.cells[row][col - 1].x + this.model.cells[row][col - 1].width;
                }
            }
        }
        if (this.resizeEdge === "bottom") {
            for (let col = 0; col < this.model.cols; col++) {
                for (let row = this.resizeRow + 1; row < this.model.rows; row++) {
                    this.model.cells[row][col].y = this.model.cells[row - 1][col].y + this.model.cells[row - 1][col].height;
                }
            }
        }
    }
    /**
     * Update the green fill handle overlay position and visibility
     */
    updateFillHandle() {
        const handle = document.getElementById('fill-handle');
        if (!handle)
            return;
        const row = this.model.selectedRow;
        const col = this.model.selectedCol;
        if (row < 0 || col < 0 || row >= this.model.rows || col >= this.model.cols) {
            handle.style.display = 'none';
            return;
        }
        const cell = this.model.cells[row][col];
        // Get canvas offset relative to document
        const canvasRect = this.canvas.getBoundingClientRect();
        console.log(canvasRect.left);
        console.log(cell.x);
        console.log(cell.width);
        console.log(window.scrollX);
        handle.style.left = `${cell.x + cell.width - 5}px`;
        handle.style.top = `${+cell.y + cell.height - 5}px`;
        handle.style.display = 'block';
    }
    disablefilhandle() {
        const handle = document.getElementById('fill-handle');
        if (!handle)
            return;
        handle.style.display = 'none';
    }
    attach() {
        const getPointerPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        let pointerWasResize = false;
        const showInput = (row, col) => {
            const cell = this.model.cells[row][col];
            this.input.style.left = `${cell.x}px`;
            this.input.style.top = `${cell.y}px`;
            this.input.style.width = `${cell.width}px`;
            this.input.style.height = `${cell.height}px`;
            this.input.value = cell.data;
            this.input.style.display = "block";
            this.input.style.border = '2px solid #0a753a ';
            this.input.focus();
            this.updateFillHandle();
            this.input.onblur = () => {
                cell.data = this.input.value;
                this.input.style.display = "none";
                this.disablefilhandle();
                this.renderer.draw(this.model, this.hoveredResizeRow, this.hoveredResizeCol, this.hoveredResizeEdge);
                this.updateFillHandle();
            };
        };
        // Pointer down
        this.canvas.addEventListener("pointerdown", (e) => {
            const { x, y } = getPointerPos(e);
            // Check resize handles
            for (let row = 0; row < this.model.rows; row++) {
                for (let col = 0; col < this.model.cols; col++) {
                    const edge = this.model.cells[row][col].getResizeEdge(x, y);
                    if (edge) {
                        this.resizing = true;
                        this.resizeRow = row;
                        this.resizeCol = col;
                        this.resizeEdge = edge;
                        this.startX = x;
                        this.startY = y;
                        this.startWidth = this.model.cells[row][col].width;
                        this.startHeight = this.model.cells[row][col].height;
                        this.canvas.setPointerCapture(e.pointerId);
                        pointerWasResize = true;
                        return;
                    }
                }
            }
            pointerWasResize = false;
            // Find cell under mouse
            let found = false;
            for (let row = 0; row < this.model.rows && !found; row++) {
                for (let col = 0; col < this.model.cols && !found; col++) {
                    const cell = this.model.cells[row][col];
                    if (x >= cell.x &&
                        x < cell.x + cell.width &&
                        y >= cell.y &&
                        y < cell.y + cell.height) {
                        this.model.selectedRow = row;
                        this.model.selectedCol = col;
                        found = true;
                        this.updateFillHandle();
                    }
                }
            }
            if (!found) {
                this.updateFillHandle();
            }
        });
        // Pointer up
        this.canvas.addEventListener("pointerup", (e) => {
            if (this.resizing) {
                this.resizing = false;
                this.resizeRow = -1;
                this.resizeCol = -1;
                this.resizeEdge = null;
                this.canvas.releasePointerCapture(e.pointerId);
                this.canvas.style.cursor = "default";
                pointerWasResize = true;
                this.updateFillHandle();
                return;
            }
            if (!pointerWasResize) {
                if (this.model.selectedRow < this.model.rows && this.model.selectedCol < this.model.cols) {
                    if (this.input.style.display !== "block") {
                        showInput(this.model.selectedRow, this.model.selectedCol);
                    }
                }
            }
            pointerWasResize = false;
            this.updateFillHandle();
        });
        // Pointer move
        this.canvas.addEventListener("pointermove", (e) => {
            const { x, y } = getPointerPos(e);
            if (this.resizing) {
                if (this.resizeEdge === "right" && this.resizeCol !== -1) {
                    const newWidth = Math.max(20, this.startWidth + (x - this.startX));
                    for (let r = 0; r < this.model.rows; r++) {
                        this.model.cells[r][this.resizeCol].width = newWidth;
                    }
                }
                else if (this.resizeEdge === "bottom" && this.resizeRow !== -1) {
                    const newHeight = Math.max(15, this.startHeight + (y - this.startY));
                    for (let c = 0; c < this.model.cols; c++) {
                        this.model.cells[this.resizeRow][c].height = newHeight;
                    }
                }
                this.updateCellPositionsAfterResize();
                this.renderer.draw(this.model, this.hoveredResizeRow, this.hoveredResizeCol, this.hoveredResizeEdge);
                // this.updateFillHandle();
                e.preventDefault();
                return;
            }
            // Handle hover state for resize handles
            let found = false;
            for (let row = 0; row < this.model.rows && !found; row++) {
                for (let col = 0; col < this.model.cols && !found; col++) {
                    const edge = this.model.cells[row][col].getResizeEdge(x, y);
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
            this.renderer.draw(this.model, this.hoveredResizeRow, this.hoveredResizeCol, this.hoveredResizeEdge);
            // this.updateFillHandle();
        });
        // Keyboard navigation and editing
        document.addEventListener("keydown", (e) => {
            if (this.input.style.display === "block") {
                const currentCell = this.model.cells[this.model.selectedRow][this.model.selectedCol];
                currentCell.data = this.input.value;
                this.renderer.draw(this.model, this.hoveredResizeRow, this.hoveredResizeCol, this.hoveredResizeEdge);
                switch (e.key) {
                    case "ArrowUp":
                        if (this.model.selectedRow > 0)
                            this.model.selectedRow--;
                        break;
                    case "ArrowDown":
                        if (this.model.selectedRow < this.model.rows - 1)
                            this.model.selectedRow++;
                        break;
                    case "ArrowLeft":
                        if (this.model.selectedCol > 0)
                            this.model.selectedCol--;
                        break;
                    case "ArrowRight":
                        if (this.model.selectedCol < this.model.cols - 1)
                            this.model.selectedCol++;
                        break;
                    case "Enter":
                        if (this.model.selectedRow < this.model.rows - 1)
                            this.model.selectedRow++;
                        break;
                    default:
                        return;
                }
                e.preventDefault();
                showInput(this.model.selectedRow, this.model.selectedCol);
                this.updateFillHandle();
            }
        });
        showInput(0, 0);
    }
}
