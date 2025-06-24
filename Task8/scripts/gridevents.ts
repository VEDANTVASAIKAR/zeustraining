import { GridModel } from "./gridmodel.js";
import { GridRenderer } from "./gridrenderer.js";

export class GridEvents {
  model: GridModel;
  renderer: GridRenderer;
  canvas: HTMLCanvasElement;
  input: HTMLInputElement;

  // For resizing
  resizing: boolean = false;
  resizeRow: number = -1;
  resizeCol: number = -1;
  resizeEdge: "right" | "bottom" | null = null;
  startX: number = 0;
  startY: number = 0;
  startWidth: number = 0;
  startHeight: number = 0;

  // For hover handles
  hoveredResizeRow: number = -1;
  hoveredResizeCol: number = -1;
  hoveredResizeEdge: "right" | "bottom" | null = null;

  constructor(model: GridModel, renderer: GridRenderer, canvas: HTMLCanvasElement, input: HTMLInputElement) {
    this.model = model;
    this.renderer = renderer;
    this.canvas = canvas;
    this.input = input;
    this.attach();
  }

  private updateCellPositionsAfterResize() {
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

  attach() {
    const getPointerPos = (e: PointerEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    let pointerWasResize = false;

    const showInput = (row: number, col: number) => {
      const cell = this.model.cells[row][col];
      this.input.style.left = `${cell.x}px`;
      this.input.style.top = `${cell.y}px`;
      this.input.style.width = `${cell.width}px`;
      this.input.style.height = `${cell.height}px`;
      this.input.value = cell.data;
      this.input.style.display = "block";
      this.input.focus();
      this.input.onblur = () => {
        cell.data = this.input.value;
        this.input.style.display = "none";
        this.renderer.draw(this.model, this.hoveredResizeRow, this.hoveredResizeCol, this.hoveredResizeEdge);
      };
    };

    // Pointer down
    this.canvas.addEventListener("pointerdown", (e: PointerEvent) => {
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
          if (
            x >= cell.x &&
            x < cell.x + cell.width &&
            y >= cell.y &&
            y < cell.y + cell.height
          ) {
            this.model.selectedRow = row;
            this.model.selectedCol = col;
            found = true;
          }
        }
      }
    });

    // Pointer up
    this.canvas.addEventListener("pointerup", (e: PointerEvent) => {
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
        if (this.model.selectedRow < this.model.rows && this.model.selectedCol < this.model.cols) {
          if (this.input.style.display !== "block") {
            showInput(this.model.selectedRow, this.model.selectedCol);
          }
        }
      }
      pointerWasResize = false;
    });

    // Pointer move
    this.canvas.addEventListener("pointermove", (e: PointerEvent) => {
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
    });

    // Keyboard navigation and editing
    document.addEventListener("keydown", (e) => {
      if (this.input.style.display === "block") {
        const currentCell = this.model.cells[this.model.selectedRow][this.model.selectedCol];
        currentCell.data = this.input.value;
        this.renderer.draw(this.model, this.hoveredResizeRow, this.hoveredResizeCol, this.hoveredResizeEdge);

        switch (e.key) {
          case "ArrowUp":
            if (this.model.selectedRow > 0) this.model.selectedRow--;
            break;
          case "ArrowDown":
            if (this.model.selectedRow < this.model.rows - 1) this.model.selectedRow++;
            break;
          case "ArrowLeft":
            if (this.model.selectedCol > 0) this.model.selectedCol--;
            break;
          case "ArrowRight":
            if (this.model.selectedCol < this.model.cols - 1) this.model.selectedCol++;
            break;
          case "Enter":
            if (this.model.selectedRow < this.model.rows - 1) this.model.selectedRow++;
            break;
          default:
            return;
        }

        e.preventDefault();
        showInput(this.model.selectedRow, this.model.selectedCol);
      }
    });
  }
}