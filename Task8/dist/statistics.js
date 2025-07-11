/**
 * Manages statistical calculations on selected cells.
 * Listens for selection-changed events and supports multi-range selection.
 */
export class Statistics {
    constructor(canvas, cellManager) {
        this.canvas = canvas;
        this.cellManager = cellManager;
        this.selection = null;
        this.selectionarr = [];
        this.output = document.getElementById('output');
        this.couunt = document.querySelector('.count');
        this.summ = document.querySelector('.sum');
        this.minimum = document.querySelector('.min');
        this.maximum = document.querySelector('.max');
        this.average = document.querySelector('.avg');
        // Listen for selection changes
        window.addEventListener('selection-changed', (event) => {
            this.selection = event.detail.selection;
            this.selectionarr = event.detail.selectionarr || [];
        });
        this.couunt.addEventListener('click', () => {
            let count = this.count();
            this.output.value = `${count}`;
        });
        this.summ.addEventListener('click', () => {
            let sum = this.sum();
            this.output.value = `${sum}`;
        });
        this.minimum.addEventListener('click', () => {
            let min = this.min();
            this.output.value = `${min}`;
        });
        this.maximum.addEventListener('click', () => {
            let max = this.max();
            this.output.value = `${max}`;
        });
        this.average.addEventListener('click', () => {
            let avg = this.avg();
            this.output.value = `${avg}`;
        });
    }
    setSelectionManager(selectionManager) {
        this.SelectionManager = selectionManager;
    }
    /**
     * Gets all cells within all current selection ranges
     * @returns Array of cell objects from all selected ranges, or empty array if no selection
     */
    getSelectedCells() {
        const selectedCells = [];
        const ranges = this.selectionarr && this.selectionarr.length > 0
            ? this.selectionarr
            : (this.selection ? [this.selection] : []);
        for (const range of ranges) {
            const { startRow, startCol, endRow, endCol } = range;
            for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                    const cell = this.cellManager.getCell(row, col);
                    if (cell) {
                        selectedCells.push(cell);
                    }
                    else {
                        selectedCells.push({
                            row: row,
                            col: col,
                            value: null,
                            isSelected: true
                        });
                    }
                }
            }
        }
        return selectedCells;
    }
    printvalues() {
        let cells = this.getSelectedCells();
        for (let i = 0; i < cells.length; i++) {
            // console.log(cells[i].value);
        }
    }
    count() {
        let cells = this.getSelectedCells();
        let count = 0;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].value !== null && cells[i].value !== '') {
                count++;
            }
        }
        return count;
    }
    sum() {
        let cells = this.getSelectedCells();
        let sum = 0;
        for (let i = 0; i < cells.length; i++) {
            const val = parseFloat(cells[i].value);
            if (!isNaN(val)) {
                sum += val;
            }
        }
        return sum;
    }
    avg() {
        let cells = this.getSelectedCells();
        let sum = 0;
        let count = 0;
        for (let i = 0; i < cells.length; i++) {
            const val = parseFloat(cells[i].value);
            if (!isNaN(val)) {
                sum += val;
                count++;
            }
        }
        return count === 0 ? null : (sum / count);
    }
    min() {
        let cells = this.getSelectedCells();
        let min = Infinity;
        for (let i = 0; i < cells.length; i++) {
            const val = parseFloat(cells[i].value);
            if (!isNaN(val) && val < min) {
                min = val;
            }
        }
        return min === Infinity ? null : min;
    }
    max() {
        let cells = this.getSelectedCells();
        let max = -Infinity;
        for (let i = 0; i < cells.length; i++) {
            const val = parseFloat(cells[i].value);
            if (!isNaN(val) && val > max) {
                max = val;
            }
        }
        return max === -Infinity ? null : max;
    }
}
