import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { findIndexFromCoord } from "./utils.js"; 
import { CellManager } from "./cellmanager.js";
import { EventManager } from "./eventmanager.js";
import { selectionManager } from "./selectionmanager.js";
import { Statistics } from "./statistics.js";

let selectedRow: number | null = null;
let selectedCol: number | null = null;

let container = document.querySelector('.container') as HTMLElement ;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const overlay = document.getElementById("overlay") as HTMLCanvasElement;

// Combined function that handles both resizing and DPI adjustment
function resizeCanvasesWithDPI() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  
  // Set the physical pixel dimensions
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  overlay.width = width * dpr;
  overlay.height = height * dpr;
  
  // Set the CSS dimensions
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  overlay.style.width = `${width}px`;
  overlay.style.height = `${height}px`;
  
  // Scale the context
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  const overlayCtx = overlay.getContext('2d');
  if (overlayCtx) {
    overlayCtx.scale(dpr, dpr);
  }
}

// Use this single function for both initial setup and resize events
window.addEventListener('resize', resizeCanvasesWithDPI);
resizeCanvasesWithDPI(); // Call immediately to set initial size

const rows = new Rows(100);
const cols = new Cols(500); 

const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols,cellManager);

// Initial rendering
grid.rendervisible(rows, cols);


const Inputdiv = document.getElementById("inputt") as HTMLElement;
console.log(Inputdiv.innerHTML);

const cellInput = document.getElementById("cellInput") as HTMLInputElement;
const statistics = new Statistics(canvas,cellManager)
// pass grid and cellManager to event manager
const SelectionManager = new selectionManager(grid,rows,cols,cellManager,canvas,statistics)

const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager,SelectionManager);


SelectionManager.seteventmanager(eventManager);

console.log(cols.widths);



