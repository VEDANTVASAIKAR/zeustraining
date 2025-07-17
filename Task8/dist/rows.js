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
    n, 
    /** @type {number[]} Array storing the height of each row */
    heights = []) {
        this.n = n;
        this.heights = heights;
        /** @type {number[]} Array storing the cumulative positions of each row */
        this.positions = [];
        if (this.heights.length === 0) {
            this.heights = Array(n).fill(25); // Default height
        }
        this.calculatePositions();
    }
    /**
     * Calculates the cumulative positions based on heights
     * @private
     */
    calculatePositions() {
        this.positions = [0]; // First position is always 0
        let currentPos = 0;
        for (let i = 0; i < this.n; i++) {
            currentPos += this.heights[i];
            this.positions.push(currentPos);
        }
    }
    /**
     * Sets the height of a specific row and updates positions
     * @param {number} rowIndex Index of the row.
     * @param {number} height New height to set.
     */
    setHeight(rowIndex, height) {
        const oldHeight = this.heights[rowIndex];
        this.heights[rowIndex] = height;
        // Update positions after the changed row
        const diff = height - oldHeight;
        if (diff !== 0) {
            for (let i = rowIndex + 1; i <= this.n; i++) {
                this.positions[i] += diff;
            }
        }
    }
    /**
     * Gets the height of a specific row.
     * @param {number} rowIndex Index of the row.
     * @returns {number} The height of the row.
     */
    getHeight(rowIndex) {
        return this.heights[rowIndex];
    }
    /**
     * Gets the position (y-coordinate) of a specific row
     * @param {number} rowIndex Index of the row
     * @returns {number} The starting y-position of the row
     */
    getPosition(rowIndex) {
        return this.positions[rowIndex];
    }
}
