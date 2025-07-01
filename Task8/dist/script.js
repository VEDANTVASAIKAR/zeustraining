import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CellManager } from "./cellmanager.js";
import { EventManager } from "./eventmanager.js";
import { selectionManager } from "./selectionmanager.js";
let selectedRow = null;
let selectedCol = null;
let container = document.querySelector('.container');
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
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
resizeCanvases(); // Call immediately to set initial size
const rows = new Rows(1000);
const cols = new Cols(500);
const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols, cellManager);
// Initial rendering
grid.rendervisible(rows, cols);
const Inputdiv = document.getElementById("inputt");
console.log(Inputdiv.innerHTML);
const cellInput = document.getElementById("cellInput");
// pass grid and cellManager to event manager
const SelectionManager = new selectionManager(grid, rows, cols, cellManager, canvas);
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager, SelectionManager);
console.log(cols.widths);
