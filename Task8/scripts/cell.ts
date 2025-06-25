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
        public row: number,
        /** @type {number} The column index of the cell */
        public col: number,
        /** @type {string|number|null} The value stored in the cell */
        public value: string | number | null = null,
        /** @type {boolean} Whether the cell is selected */
        public isSelected: boolean = false
    ) {}
}