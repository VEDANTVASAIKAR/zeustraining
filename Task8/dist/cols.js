/**
 * Manages columns in the grid, including their count and individual widths.
 */
export class Cols {
    /**
     * @param {number} n The number of columns.
     * @param {number[]} widths Optional array of column widths.
     */
    constructor(
    /** @type {number} Number of columns */
    n, 
    /** @type {number[]} Array storing the width of each column */
    widths = []) {
        this.n = n;
        this.widths = widths;
        // Give each column the default width if not provided
        if (this.widths.length === 0) {
            this.widths = Array(n).fill(100); // Default width for all columns
        }
        // Ensure the first column is always 40
        this.widths[0] = 50;
    }
    /**
     * @param {number} colIndex Index of the column.
     * @param {number} width New width to set.
     */
    setWidth(colIndex, width) {
        this.widths[colIndex] = width;
    }
    /**
     * @param {number} colIndex Index of the column.
     * @returns {number} The width of the column.
     */
    getWidth(colIndex) {
        return this.widths[colIndex];
    }
}
