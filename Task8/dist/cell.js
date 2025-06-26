export class Cell {
    /**
     * @param {number} row The row index of the cell
     * @param {number} col The column index of the cell
     * @param {string|number|null} value The value stored in the cell
     * @param {boolean} isSelected Whether the cell is currently selected
     */
    constructor(row, col, value = null, isSelected = false) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.isSelected = isSelected;
    }
}
