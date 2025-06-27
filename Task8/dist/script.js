import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CellManager } from "./cellmanager.js";
import { EventManager } from "./eventmanager.js";
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
resizeCanvases();
const rows = new Rows(500);
const cols = new Cols(100);
const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols, cellManager);
grid.drawRows(rows, cols);
grid.drawCols(rows, cols);
grid.columnheaders(rows, cols);
grid.rowheaders(rows, cols);
const cellInput = document.getElementById("cellInput");
// pass grid and cellManager to event manager
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager);
console.log(cols.widths);
