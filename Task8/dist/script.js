import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";
import { EventManager } from "./eventmanager.js";
const rows = new Rows(100);
const cols = new Cols(50);
const grid = new GridDrawer("canvas", rows, cols);
grid.drawRows(rows, cols);
grid.drawCols(rows, cols);
const canvas = document.getElementById("canvas");
const cellInput = document.getElementById("cellInput");
// event manager
const eventManager = new EventManager(canvas, cellInput, rows, cols);
