import { CellManager } from './cellmanager.js';
import { selectionManager } from './selectionmanager.js';

/**
 * Manages statistical calculations on selected cells.
 * Listens for selection-changed events and supports multi-range selection.
 */
export class Statistics {
    selection: { startRow: number; startCol: number; endRow: number; endCol: number; } | null = null;
    selectionarr: { startRow: number; startCol: number; endRow: number; endCol: number; }[] = [];
    output: HTMLInputElement = document.getElementById('output') as HTMLInputElement;
    couunt: HTMLElement = document.querySelector('.count') as HTMLElement;
    summ: HTMLElement = document.querySelector('.sum') as HTMLElement;
    minimum: HTMLElement = document.querySelector('.min') as HTMLElement;
    maximum: HTMLElement = document.querySelector('.max') as HTMLElement;
    average: HTMLElement = document.querySelector('.avg') as HTMLElement;
    SelectionManager?: selectionManager;

    constructor(
        private canvas: HTMLCanvasElement,
        private cellManager: CellManager,
    ) {
        // Listen for selection changes
        window.addEventListener('selection-changed', (event: any) => {
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

    setSelectionManager(selectionManager: selectionManager) {
        this.SelectionManager = selectionManager;
    }

    /**
     * Gets all cells within all current selection ranges
     * @returns Array of cell objects from all selected ranges, or empty array if no selection
     */
    getSelectedCells() {
        const selectedCells: any[] = [];
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
                    } else {
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
            const val = parseFloat(cells[i].value as string);
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
            const val = parseFloat(cells[i].value as string);
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
            const val = parseFloat(cells[i].value as string);
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
            const val = parseFloat(cells[i].value as string);
            if (!isNaN(val) && val > max) {
                max = val;
            }
        }
        return max === -Infinity ? null : max;
    }



}