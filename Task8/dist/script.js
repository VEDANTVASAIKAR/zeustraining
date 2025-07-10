import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CellManager } from "./cellmanager.js";
import { EventManager } from "./eventmanager.js";
import { selectionManager } from "./selectionmanager.js";
import { Statistics } from "./statistics.js";
import { GridDataGen } from "./generatedata.js";
import { PointerHandlers } from "./pointerhandlers.js";
import { ResizeRows } from "./resizerows.js";
import { ResizeCols } from "./resizecols.js";
let selectedRow = null;
let selectedCol = null;
let container = document.querySelector('.container');
const canvas = document.getElementById("canvas");
const overlay = document.getElementById("overlay");
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
const cols = new Cols(50);
const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols, cellManager);
// Initial rendering
grid.rendervisible(rows, cols);
const Inputdiv = document.getElementById("inputt");
// console.log(Inputdiv.innerHTML);
const cellInput = document.getElementById("cellInput");
// pass grid and cellManager to event manager
const statistics = new Statistics(canvas, cellManager);
const SelectionManager = new selectionManager(grid, rows, cols, cellManager, canvas, statistics);
statistics.setSelectionManager(SelectionManager);
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager, SelectionManager);
SelectionManager.seteventmanager(eventManager);
grid.setSelectionManager(SelectionManager);
const resizerows = new ResizeRows(cols, rows, grid, eventManager, SelectionManager);
const resizecols = new ResizeCols(cols, rows, grid, eventManager, SelectionManager);
const pointerHandlers = new PointerHandlers(container, eventManager, SelectionManager, resizerows, resizecols);
/**
 * Loads data into the grid.
 * @param {any[]} data - An array of objects to load.
 */
function loadData(data) {
    if (!data || data.length === 0) {
        return;
    }
    // Get headers from the first object's keys
    const headers = Object.keys(data[0]);
    // Populate column headers (starting from col 1)
    headers.forEach((header, colIndex) => {
        // We use colIndex + 1 because column 0 is for row numbers.
        cellManager.setCell(0, colIndex + 1, header);
    });
    // Populate data rows
    data.forEach((dataRow, rowIndex) => {
        // We use rowIndex + 1 because row 0 is for headers.
        headers.forEach((header, colIndex) => {
            // colIndex + 1 to align with headers
            cellManager.setCell(rowIndex + 1, colIndex + 1, dataRow[header]);
        });
    });
    // Redraw the grid to show the new data
    grid.rendervisible(rows, cols);
}
let data = new GridDataGen(90);
let values = data.generateData();
// console.log(values);
// Load the generated data into the grid
loadData(values);
