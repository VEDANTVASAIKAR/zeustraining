/**
 * Manages columns in the grid, including their count and individual widths.
 */
export class Cols {
    /** @type {number[]} Array storing the cumulative positions of each column */
    public positions: number[] = [];

    /**
     * @param {number} n The number of columns.
     * @param {number[]} widths Optional array of column widths.
     */
    constructor(
        /** @type {number} Number of columns */
        public n: number,
        /** @type {number[]} Array storing the width of each column */
        public widths: number[] = []
    ) {
        // Give each column the default width if not provided
        if (this.widths.length === 0) {
            this.widths = Array(n).fill(100); // Default width for all columns
        }
        // Ensure the first column is always 50
        this.widths[0] = 50;
        
        this.calculatePositions();
    }

    /**
     * Calculates the cumulative positions based on widths
     * @private
     */
    private calculatePositions(): void {
        this.positions = [0]; // First position is always 0
        let currentPos = 0;
        for (let i = 0; i < this.n; i++) {
            currentPos += this.widths[i];
            this.positions.push(currentPos);
        }
    }

    /**
     * @param {number} colIndex Index of the column.
     * @param {number} width New width to set.
     */
    setWidth(colIndex: number, width: number): void {
        const oldWidth = this.widths[colIndex];
        this.widths[colIndex] = width;
        
        // Update positions after the changed column
        const diff = width - oldWidth;
        if (diff !== 0) {
            for (let i = colIndex + 1; i <= this.n; i++) {
                this.positions[i] += diff;
            }
        }
    }

    /**
     * @param {number} colIndex Index of the column.
     * @returns {number} The width of the column.
     */
    getWidth(colIndex: number): number {
        return this.widths[colIndex];
    }

    /**
     * Gets the position (x-coordinate) of a specific column
     * @param {number} colIndex Index of the column
     * @returns {number} The starting x-position of the column
     */
    getPosition(colIndex: number): number {
        return this.positions[colIndex];
    }
}