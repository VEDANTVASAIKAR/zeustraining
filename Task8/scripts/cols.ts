/**
 * Manages columns in the grid, including their count and individual widths.
 */
export class Cols {
    /**
     * Initializes the Cols object.
     * @param {number} n The number of columns.
     * @param {number} defaultWidth The default width of each column.
     */
    constructor(
        /** @type {number} Number of columns */
        public n: number,
        /** @type {number[]} Array storing the width of each column */
        public widths: number[] = []
    ) {
        // Give each column the default width if not provided
        if (this.widths.length === 0) {
            this.widths = Array(n).fill(100); // You can use a constant if you prefer
        }
    }

    /**
     * Sets the width of a specific column.
     * @param {number} colIndex Index of the column.
     * @param {number} width New width to set.
     */
    setWidth(colIndex: number, width: number) {
        this.widths[colIndex] = width;
    }

    /**
     * Gets the width of a specific column.
     * @param {number} colIndex Index of the column.
     * @returns {number} The width of the column.
     */
    getWidth(colIndex: number): number {
        return this.widths[colIndex];
    }
}