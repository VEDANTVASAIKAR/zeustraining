import { Cell } from "./cell.js";
export class CellManager {
    /**
     * Initializes the CellManager object.
     */
    constructor() {
        this.cellMap = new Map();
    }
    /**
     * @param {number} row Row index
     * @param {number} col Column index
     * @returns {string} Key as "row,col"
     */
    getKey(row, col) {
        return `${row},${col}`;
    }
    /**
     * Gets the cell at given row and column, or undefined if not present.
     * @param {number} row Row index
     * @param {number} col Column index
     * @returns {Cell | undefined}
     */
    getCell(row, col) {
        return this.cellMap.get(this.getKey(row, col));
    }
    /**
     * Sets the value for a cell at (row, col). Creates cell if not present.
     * @param {number} row Row index
     * @param {number} col Column index
     * @param {string|number|null} value Value to set
     * @returns {Cell} The created or updated cell.
     */
    setCell(row, col, value) {
        let cell = this.getCell(row, col);
        if (!cell) {
            cell = new Cell(row, col, value);
            this.cellMap.set(this.getKey(row, col), cell);
            console.log(`CREATED new Cell at (${row}, ${col}) with value:`, value);
            console.log('Total cells with data:', this.cellMap.size);
        }
        else {
            cell.value = value;
            console.log(`UPDATED Cell at (${row}, ${col}) to value:`, value);
        }
        return cell;
    }
}
