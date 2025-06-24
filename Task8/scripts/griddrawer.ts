import { GridModel } from "./gridmodel.js";
import { GridRenderer } from "./gridrenderer.js";
import { GridEvents } from "./gridevents.js";

export class GridDrawer {
  model: GridModel;
  renderer: GridRenderer;
  events: GridEvents;

  constructor(canvasId: string, inputId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!canvas || !input) throw new Error("Canvas or input not found");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");

    // Set canvas size (no headers)
    const rows = 50, cols = 20, cellWidth = 100, cellHeight = 30;
    canvas.width = cols * cellWidth;
    canvas.height = rows * cellHeight;

    this.model = new GridModel(rows, cols, cellWidth, cellHeight);
    this.renderer = new GridRenderer(canvas, ctx);
    this.events = new GridEvents(this.model, this.renderer, canvas, input);

    this.renderer.draw(this.model, -1, -1, null);
  }
}