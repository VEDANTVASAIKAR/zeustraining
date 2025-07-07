// statistics.ts
import { CellManager } from './cellmanager.js';
import { selectionManager } from './selectionmanager.js';

/**
 * Manages statistical calculations on selected cells
 * /**
 * @param {HTMLCanvasElement} canvas The canvas element to listen for selection events
 * @param {CellManager} cellManager Reference to the cell manager to access cell data
 */

export class Statistics {
    selection : {startRow: number;startCol: number; endRow: number;endCol: number;} | null = null ;
    output: HTMLInputElement = document.getElementById('output') as HTMLInputElement;
    couunt :HTMLElement = document.querySelector('.count') as HTMLElement;
    summ : HTMLElement = document.querySelector('.sum') as HTMLElement;
    minimum :HTMLElement = document.querySelector('.min') as HTMLElement;
    maximum :HTMLElement = document.querySelector('.max') as HTMLElement;
    average :HTMLElement = document.querySelector('.avg') as HTMLElement;

    constructor(
        private canvas: HTMLCanvasElement,
        private cellManager: CellManager,
        
    ) {
        // Listen for selection changes
        this.canvas.addEventListener('selection-changed', (event: any) => {
            this.selection = event.detail.selection;
            // console.log(this.selection);
        });
        this.couunt.addEventListener('click', () => {
            let count = this.count();
            this.output.value = `${count}`
        });
        this.summ.addEventListener('click', () => {
            let sum = this.sum();       
            this.output.value = `${sum}`
        });
        this.minimum.addEventListener('click', () => {
            let min = this.min();
            this.output.value = `${min}`
        });0
        this.maximum.addEventListener('click', () => {
            let max = this.max();
            this.output.value = `${max}`
        });
        this.average.addEventListener('click', () => {
            let avg = this.avg();
            this.output.value = `${avg}`
        });
        
        
    }

    /**
     * Gets all cells within the current selection range
     * @returns Array of cell objects from the selected range, or empty array if no selection
     */
    getSelectedCells() {
        if (!this.selection) return [];
        
        const { startRow, startCol, endRow, endCol } = this.selection;
        const selectedCells = [];
        
        // Loop through all cells in the selection range
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = this.cellManager.getCell(row, col);
                
                // Add the cell to our array if it exists
                if (cell) {
                    selectedCells.push(cell);
                } else {
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

    printvalues(){
        let cells = this.getSelectedCells()
        for (let i =0; i< cells.length;i++){
            // console.log(cells[i].value);
            // console.log(i);
            
            
        }
    }

    count() {
        let cells = this.getSelectedCells();
        let count = 0;
        for (let i = 0; i < cells.length; i++) {
            // Only count cells that have a value
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
        if (count === 0) {
            // console.log("No numeric values selected");
        } else {
            let avg = sum / count;
            return avg;
        }
    }

    min() {
        let cells = this.getSelectedCells();
        let min = Infinity; // Start with the highest possible value

        for (let i = 0; i < cells.length; i++) {
            const val = parseFloat(cells[i].value as string);
            if (!isNaN(val)) {
                if (val < min) {
                    min = val;
                }
            }
        }
        // console.log(min === Infinity ? 'No numeric values' : min);
        return min === Infinity ? null : min; // Return null if no numeric values found
    }

    max() {
        let cells = this.getSelectedCells();
        let max = -Infinity; // Start with the lowest possible value

        for (let i = 0; i < cells.length; i++) {
            const val = parseFloat(cells[i].value as string);
            if (!isNaN(val)) {
                if (val > max) {
                    max = val;
                }
            }
        }

        if (max === -Infinity) {
            // console.log('No numeric values');
        } else {
            // console.log('Max:', max);
        }
        return max === -Infinity ? null : max; // Return null if no numeric values found
    }
}