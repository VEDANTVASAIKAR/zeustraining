import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { CELL_WIDTH, CELL_HEIGHT } from "./constants.js";
import { findIndexFromCoord } from "./utils.js"; 
import { EventManager } from "./eventmanager.js";


const rows = new Rows(100);
const cols = new Cols(50); 
const grid = new GridDrawer("canvas",rows,cols);


grid.drawRows(rows, cols);
grid.drawCols(rows, cols);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const cellInput = document.getElementById("cellInput") as HTMLInputElement;

// event manager
const eventManager = new EventManager(canvas, cellInput, rows, cols);