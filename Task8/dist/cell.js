/**
 * Represents a single cell in the grid.
 */
export class Cell {
    /**
     * Initializes the Cell object.
     * @param {number} row The row index of the cell
     * @param {number} col The column index of the cell
     * @param {string|number|null} value The value stored in the cell
     * @param {boolean} isSelected Whether the cell is currently selected
     */
    constructor(
    /** @type {number} The row index of the cell */
    row, 
    /** @type {number} The column index of the cell */
    col, 
    /** @type {string|number|null} The value stored in the cell */
    value = null, 
    /** @type {boolean} Whether the cell is selected */
    isSelected = false) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.isSelected = isSelected;
    }
}
