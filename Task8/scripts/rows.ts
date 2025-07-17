/**
 * Manages rows in the grid, including their count and individual heights.
 */
export class Rows {
    /** @type {number[]} Array storing the cumulative positions of each row */
    public positions: number[] = [];

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
            this.heights = Array(n).fill(25); // Default height
        }
        this.calculatePositions();
    }

    /**
     * Calculates the cumulative positions based on heights
     * @private
     */
    private calculatePositions(): void {
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
    setHeight(rowIndex: number, height: number): void {
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
    getHeight(rowIndex: number): number {
        return this.heights[rowIndex];
    }

    /**
     * Gets the position (y-coordinate) of a specific row
     * @param {number} rowIndex Index of the row
     * @returns {number} The starting y-position of the row
     */
    getPosition(rowIndex: number): number {
        return this.positions[rowIndex];
    }
}