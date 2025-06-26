import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CellManager } from "./cellmanager.js";
import { EventManager } from "./eventmanager.js";
let selectedRow = null;
let selectedCol = null;
const rows = new Rows(100);
const cols = new Cols(50);
const cellManager = new CellManager();
const grid = new GridDrawer("canvas", rows, cols, cellManager);
grid.drawRows(rows, cols);
grid.drawCols(rows, cols);
grid.columnheaders(rows, cols);
const canvas = document.getElementById("canvas");
const cellInput = document.getElementById("cellInput");
// pass grid and cellManager to event manager
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager);
console.log(cols.widths);
