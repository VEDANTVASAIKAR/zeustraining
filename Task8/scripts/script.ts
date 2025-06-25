import { GridDrawer } from "./griddrawer.js";
import { Rows } from "./rows.js";
import { Cols } from "./cols.js";


const rows = new Rows(100);
const cols = new Cols(50); 
const grid = new GridDrawer("canvas",rows,cols);


grid.drawRows(rows, cols);
grid.drawCols(rows, cols);