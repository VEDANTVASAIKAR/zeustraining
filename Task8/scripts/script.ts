import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { findIndexFromCoord } from "./utils.js"; 
import { CellManager } from "./cellmanager.js";
import { EventManager } from "./eventmanager.js";

let selectedRow: number | null = null;
let selectedCol: number | null = null;


const rows = new Rows(100);
const cols = new Cols(500); 
const grid = new GridDrawer("canvas", rows, cols);
const cellManager = new CellManager();

grid.drawRows(rows, cols);
grid.drawCols(rows, cols);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const cellInput = document.getElementById("cellInput") as HTMLInputElement;

// pass grid and cellManager to event manager
const eventManager = new EventManager(canvas, cellInput, rows, cols, grid, cellManager);