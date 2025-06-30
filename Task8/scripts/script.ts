import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { findIndexFromCoord } from "./utils.js"; 
import { CellManager } from "./cellmanager.js";
import { EventManager } from "./eventmanager.js";
import { selectionManager } from "./selectionmanager.js";

let selectedRow: number | null = null;
let selectedCol: number | null = null;

let container = document.querySelector('.container') as HTMLElement ;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const overlay = document.getElementById("overlay") as HTMLCanvasElement;
// Make sure both canvases always match the window size
function resizeCanvases() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  overlay.width = width;
  overlay.height = height;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

const rows = new Rows(500);
const cols = new Cols(100); 

const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols,cellManager);


grid.drawRows(rows, cols);
grid.drawCols(rows, cols);

grid.columnheaders(rows,cols)
grid.rowheaders(rows,cols)

const Inputdiv = document.getElementById("inputt") as HTMLElement;
console.log(Inputdiv.innerHTML);

const cellInput = document.getElementById("cellInput") as HTMLInputElement;

// pass grid and cellManager to event manager
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager);
const SelectionManager = new selectionManager(grid,rows,cols,cellManager,canvas)

console.log(cols.widths);



