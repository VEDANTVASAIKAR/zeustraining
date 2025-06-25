/**
 * Manages rows in the grid, including their count and individual heights.
 */
export class Rows {
    /**
     * Initializes the Rows object.
     * @param {number} n The number of rows.
     * @param {number[]} heights The heights of each row (optional).
     */
    constructor(
        /** @type {number} Number of rows */
        public n: number,
        /** @type {number[]} Array storing the height of each row */
        public heights: number[] = []
    ) {
        if (this.heights.length === 0) {
            this.heights = Array(n).fill(25); // Default height, or use a constant
        }
    }

    /**
     * Sets the height of a specific row.
     * @param {number} rowIndex Index of the row.
     * @param {number} height New height to set.
     */
    setHeight(rowIndex: number, height: number) {
        this.heights[rowIndex] = height;
    }

    /**
     * Gets the height of a specific row.
     * @param {number} rowIndex Index of the row.
     * @returns {number} The height of the row.
     */
    getHeight(rowIndex: number): number {
        return this.heights[rowIndex];
    }
}