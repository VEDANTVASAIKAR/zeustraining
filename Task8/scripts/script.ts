import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { findIndexFromCoord } from "./utils.js"; 
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
import { Painter } from "./paint.js";
import { ScrollRefresh } from "./scrollrefresh.js";
import { SelectionInputManager } from "./positioninput.js"; 
import { Commandpattern } from "./commandpattern.js";
import { Cornercell } from "./cornercell.js";


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

const rows = new Rows(100000);
const cols = new Cols(500); 

const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols,cellManager);

// Initial rendering
grid.rendervisible(rows, cols);


const Inputdiv = document.getElementById("inputt") as HTMLElement;
// console.log(Inputdiv.innerHTML);

const cellInput = document.getElementById("cellInput") as HTMLInputElement;
// pass grid and cellManager to event manager
const statistics = new Statistics(canvas,cellManager)
const selectionInputManager = new SelectionInputManager(container,cellInput,grid,rows,cols,cellManager);

const commandpattern = new Commandpattern(selectionInputManager);
const SelectionManager = new selectionManager(grid,rows,cols,cellManager,canvas,statistics,commandpattern)
statistics.setSelectionManager(SelectionManager);
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager,SelectionManager);

SelectionManager.seteventmanager(eventManager);
grid.setSelectionManager(SelectionManager);
const scrollRefresh = new ScrollRefresh(container,canvas,grid, rows, cols, cellManager);
const resizerows = new ResizeRows(cols, rows, grid, eventManager, SelectionManager,cellManager,scrollRefresh,commandpattern,selectionInputManager);
const resizecols = new ResizeCols(cols, rows, grid, eventManager, SelectionManager,cellManager,scrollRefresh,commandpattern,selectionInputManager);
const rowSelectionManager = new RowSelectionManager(grid, rows, cols, cellManager, canvas, statistics,scrollRefresh);
const colSelectionManager = new ColumnSelectionManager(grid, rows, cols, cellManager, canvas, statistics,scrollRefresh);
const keyboardSelection = new KeyboardCellSelection(grid, rows, cols, cellManager, canvas, statistics,scrollRefresh,commandpattern);
const cellSelectionManager = new CellSelectionManager(grid, rows, cols, cellManager, canvas,statistics,scrollRefresh,commandpattern,keyboardSelection);
const cornercell = new Cornercell(grid, rows, cols, cellManager, canvas, statistics, scrollRefresh);
const pointerHandlers = new PointerHandlers(container,eventManager,resizerows,resizecols,rowSelectionManager,colSelectionManager,cellSelectionManager,cornercell);



document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') commandpattern.undo();
        if (e.ctrlKey && e.key === 'y') commandpattern.redo();
    });

/**
 * Loads data into the grid.
 * @param {any[]} data - An array of objects to load.
 */
function loadData(data: any[]) {
    if (!data || data.length === 0) {
        return;
    }

    // Get headers from the first object's keys
    const headers = Object.keys(data[0]);
    // console.log("Headers:", headers);
    

    // Populate column headers (starting from col 1)
    headers.forEach((header, colIndex) => {
        // We use colIndex + 1 because column 0 is for row numbers.
        cellManager.setCell(1, colIndex +1 , header);
    });

    // Populate data rows
    data.forEach((dataRow, rowIndex) => {
        // We use rowIndex + 1 because row 0 is for headers.
        headers.forEach((header, colIndex) => {
            // colIndex + 1 to align with headers
            cellManager.setCell(rowIndex + 2, colIndex + 1, dataRow[header]);
        });
    });

    // Redraw the grid to show the new data
    grid.rendervisible(rows, cols);
}


let data = new GridDataGen(100000);
let values = data.generateData();
// console.log(values);
// Load the generated data into the grid
loadData(values);



