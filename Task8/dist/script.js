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
import { RowSelectionManager } from "./rowselection.js";
import { ColumnSelectionManager } from "./colselection.js";
import { CellSelectionManager } from "./cellselection.js";
import { KeyboardCellSelection } from "./keyboardselection.js";
import { ScrollRefresh } from "./scrollrefresh.js";
import { SelectionInputManager } from "./positioninput.js";
import { Commandpattern } from "./commandpattern.js";
import { Cornercell } from "./cornercell.js";
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
export const rows = new Rows(1000);
export const cols = new Cols(500);
const totalWidth = cols.widths.reduce((sum, w) => sum + w, 0);
const totalHeight = rows.heights.reduce((sum, h) => sum + h, 0);
const scrollable = document.getElementById('scrollable');
scrollable.style.width = `${totalWidth}px`;
scrollable.style.height = `${totalHeight}px`;
const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols, cellManager);
// Initial rendering
grid.rendervisible(rows, cols);
const Inputdiv = document.getElementById("inputt");
// console.log(Inputdiv.innerHTML);
const cellInput = document.getElementById("cellInput");
// pass grid and cellManager to event manager
const statistics = new Statistics(canvas, cellManager);
const selectionInputManager = new SelectionInputManager(container, cellInput, grid, rows, cols, cellManager);
const commandpattern = new Commandpattern(selectionInputManager);
const SelectionManager = new selectionManager(grid, rows, cols, cellManager, canvas, statistics, commandpattern);
statistics.setSelectionManager(SelectionManager);
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager, SelectionManager);
SelectionManager.seteventmanager(eventManager);
grid.setSelectionManager(SelectionManager);
const scrollRefresh = new ScrollRefresh(container, canvas, grid, rows, cols, cellManager);
const resizerows = new ResizeRows(cols, rows, grid, eventManager, SelectionManager, cellManager, scrollRefresh, commandpattern, selectionInputManager);
const resizecols = new ResizeCols(cols, rows, grid, eventManager, SelectionManager, cellManager, scrollRefresh, commandpattern, selectionInputManager);
const rowSelectionManager = new RowSelectionManager(grid, rows, cols, cellManager, canvas, statistics, scrollRefresh);
const colSelectionManager = new ColumnSelectionManager(grid, rows, cols, cellManager, canvas, statistics, scrollRefresh);
const keyboardSelection = new KeyboardCellSelection(grid, rows, cols, cellManager, canvas, statistics, scrollRefresh, commandpattern, selectionInputManager);
const cellSelectionManager = new CellSelectionManager(grid, rows, cols, cellManager, canvas, statistics, scrollRefresh, commandpattern, keyboardSelection);
const cornercell = new Cornercell(grid, rows, cols, cellManager, canvas, statistics, scrollRefresh);
const pointerHandlers = new PointerHandlers(container, eventManager, resizerows, resizecols, rowSelectionManager, colSelectionManager, cellSelectionManager, cornercell);
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z')
        commandpattern.undo();
    if (e.ctrlKey && e.key === 'y')
        commandpattern.redo();
});
function loadData(data, repeat = 1) {
    if (!data || data.length === 0 || repeat < 1)
        return;
    const headers = Object.keys(data[0]);
    // For each repetition
    for (let r = 0; r < repeat; r++) {
        const columnOffset = r * headers.length;
        // Load headers
        headers.forEach((header, colIndex) => {
            cellManager.setCell(1, columnOffset + colIndex + 1, header);
        });
        // Load data
        data.forEach((dataRow, rowIndex) => {
            headers.forEach((header, colIndex) => {
                cellManager.setCell(rowIndex + 2, columnOffset + colIndex + 1, dataRow[header]);
            });
        });
    }
    grid.rendervisible(rows, cols);
}
let data = new GridDataGen(1000);
let values = data.generateData();
// Repeat the data 5 times side by side
loadData(values, 100);
// Attach cols and rows to window for Playwright/browser tests
// @ts-ignore
window.cols = cols;
// @ts-ignore
window.rows = rows;
