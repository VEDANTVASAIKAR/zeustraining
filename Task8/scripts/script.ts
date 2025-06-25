import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";

const grid = new GridDrawer("canvas");

const rows = new Rows(20); // 20 rows
const cols = new Cols(10); // 10 columns

grid.drawRows(rows, cols);
grid.drawCols(rows, cols);