/**
 * Manages statistical calculations on selected cells
 * /**
 * @param {HTMLCanvasElement} canvas The canvas element to listen for selection events
 * @param {CellManager} cellManager Reference to the cell manager to access cell data
 */
export class Statistics {
    constructor(canvas, cellManager) {
        this.canvas = canvas;
        this.cellManager = cellManager;
        this.selection = null;
        // Listen for selection changes
        this.canvas.addEventListener('selection-changed', (event) => {
            this.selection = event.detail.selection;
            console.log(this.selection);
        });
    }
    /**
     * Gets all cells within the current selection range
     * @returns Array of cell objects from the selected range, or empty array if no selection
     */
    getSelectedCells() {
        if (!this.selection)
            return [];
        const { startRow, startCol, endRow, endCol } = this.selection;
        const selectedCells = [];
        // Loop through all cells in the selection range
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = this.cellManager.getCell(row, col);
                // Add the cell to our array if it exists
                if (cell) {
                    selectedCells.push(cell);
                }
                else {
                    // For cells that don't have data yet, we can create placeholder objects
                    // This ensures we have entries for all cells in the selection, even empty ones
                    selectedCells.push({
                        row: row,
                        col: col,
                        value: null,
                        isSelected: true
                    });
                }
            }
        }
        return selectedCells;
    }
    printvalues() {
        let cells = this.getSelectedCells();
        for (let i = 0; i < cells.length; i++) {
            console.log(cells[i].value);
        }
    }
}
