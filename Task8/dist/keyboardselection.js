import { Painter } from "./paint.js";
import { celleditcommand } from "./celleditcommand.js";
export class KeyboardCellSelection {
    constructor(griddrawer, rows, cols, cellmanager, canvas, statistics = null, scrollRefresh = null, Commandpattern) {
        this.statistics = null;
        this.eventmanager = null;
        this.scrollRefresh = null;
        this.activeSelection = null;
        this.cellInput = null;
        this.selectionarr = [];
        this.container = document.querySelector('.container');
        this.griddrawer = griddrawer;
        this.rows = rows;
        this.cols = cols;
        this.cellmanager = cellmanager;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.statistics = statistics;
        this.cellInput = document.getElementById("cellInput");
        // this.cellInput?.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.scrollRefresh = scrollRefresh;
        this.commandpattern = Commandpattern;
        this.listenSelectionChange();
        this.initKeyboardEvents();
        // this.cellInput?.addEventListener("input", (e) => {
        //     if (this.activeSelection?.startRow !== null && this.activeSelection?.startCol !== null) {
        //         const currentValue = this.cellInput?.value;
        //         if (this.activeSelection && currentValue) {
        //             this.commandpattern?.execute(
        //             new celleditcommand(
        //                 this.cellmanager, this.activeSelection.startRow,this.activeSelection.startCol, 
        //                 this.cellmanager.getCell(this.activeSelection.startRow, this.activeSelection.startCol)?.value || "", currentValue)
        //             )
        //         }
        //     }
        // });
    }
    seteventmanager(em) {
        this.eventmanager = em;
    }
    listenSelectionChange() {
        window.addEventListener('selection-changed', (e) => {
            if (e.detail) {
                this.activeSelection = e.detail.selection;
                this.selectionarr = e.detail.selectionarr;
                Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.activeSelection, this.selectionarr);
            }
        });
    }
    dispatchSelectionChangeEvent(selection) {
        // Always pass [] for selectionarr for keyboard event
        console.log(selection);
        const event = new CustomEvent('selection-changed', {
            detail: { selection, selectionarr: [] }
        });
        window.dispatchEvent(event);
    }
    initKeyboardEvents() {
        // Make canvas focusable if not already
        // this.canvas.tabIndex = 0;
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    /**
     * Handles keydown events for selection manipulation
     * @param e The keyboard event
     */
    handleKeyDown(e) {
        if (!this.activeSelection)
            return;
        // Handle movement without shift (single cell selection)
        if (e.key && !e.shiftKey) {
            let currentselectedrow = this.activeSelection.startRow;
            let currentselectedcol = this.activeSelection.startCol;
            let moved = false;
            switch (e.key) {
                case 'ArrowUp':
                    if (currentselectedrow > 1) {
                        currentselectedrow -= 1;
                        this.updateInputValue(this.activeSelection.startRow, this.activeSelection.startCol);
                        moved = true;
                    }
                    break;
                case 'ArrowDown':
                    currentselectedrow = Math.min(this.rows.n - 1, currentselectedrow + 1);
                    this.updateInputValue(this.activeSelection.startRow, this.activeSelection.startCol);
                    this.cellInput?.blur();
                    moved = true;
                    break;
                case 'ArrowLeft':
                    if (currentselectedcol > 1) {
                        currentselectedcol -= 1;
                        this.updateInputValue(this.activeSelection.startRow, this.activeSelection.startCol);
                        moved = true;
                    }
                    break;
                case 'ArrowRight':
                    currentselectedcol = Math.min(this.cols.n - 1, currentselectedcol + 1);
                    this.updateInputValue(this.activeSelection.startRow, this.activeSelection.startCol);
                    moved = true;
                    break;
                default:
                    // Focus cell input on typing keys
                    if (e.key.length === 1 &&
                        !e.ctrlKey && !e.altKey && !e.metaKey &&
                        !['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'].includes(e.key)) {
                        this.cellInput?.focus();
                        // e.preventDefault();
                    }
            }
            if (moved) {
                this.activeSelection = {
                    startRow: currentselectedrow,
                    startCol: currentselectedcol,
                    endRow: currentselectedrow,
                    endCol: currentselectedcol
                };
                // SCROLL LOGIC
                this.scrollSelectedCellIntoView(this.activeSelection, this.rows, this.cols, this.container);
                // Visual update and dispatch
                Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.activeSelection, []);
                this.dispatchSelectionChangeEvent(this.activeSelection);
                e.preventDefault();
            }
        }
        // Handle shift+arrow (range selection)
        if (e.shiftKey) {
            let newEndRow = this.activeSelection.endRow;
            let newEndCol = this.activeSelection.endCol;
            let handled = false;
            switch (e.key) {
                case 'ArrowUp':
                    newEndRow = Math.max(1, this.activeSelection.endRow - 1);
                    handled = true;
                    break;
                case 'ArrowDown':
                    newEndRow = Math.min(this.rows.n - 1, this.activeSelection.endRow + 1);
                    handled = true;
                    break;
                case 'ArrowLeft':
                    newEndCol = Math.max(1, this.activeSelection.endCol - 1);
                    handled = true;
                    break;
                case 'ArrowRight':
                    newEndCol = Math.min(this.cols.n - 1, this.activeSelection.endCol + 1);
                    handled = true;
                    break;
            }
            if (handled) {
                this.activeSelection = {
                    startRow: this.activeSelection.startRow,
                    startCol: this.activeSelection.startCol,
                    endRow: newEndRow,
                    endCol: newEndCol,
                };
                // SCROLL LOGIC
                this.scrollSelectedCellIntoView(this.activeSelection, this.rows, this.cols, this.container);
                Painter.paintSelectedCells(this.ctx, this.griddrawer, this.rows, this.cols, this.cellmanager, this.container, this.activeSelection, []);
                this.dispatchSelectionChangeEvent(this.activeSelection);
                e.preventDefault();
            }
        }
        // this.cellInput?.blur();
    }
    scrollSelectedCellIntoView(activeSelection, rows, cols, container) {
        // Compute cell's absolute position and dimensions in the virtual grid
        const cellLeft = cols.widths.slice(0, activeSelection.endCol).reduce((a, b) => a + b, 0);
        const cellTop = rows.heights.slice(0, activeSelection.endRow).reduce((a, b) => a + b, 0);
        const cellWidth = cols.widths[activeSelection.endCol];
        const cellHeight = rows.heights[activeSelection.endRow];
        // Get current viewport dimensions and scroll positions
        const viewportLeft = container.scrollLeft;
        const viewportTop = container.scrollTop;
        const viewportRight = viewportLeft + container.clientWidth;
        const viewportBottom = viewportTop + container.clientHeight;
        // Horizontal scroll logic
        const horizontalBuffer = 100;
        if (cellLeft < viewportLeft + horizontalBuffer) {
            container.scrollLeft = Math.max(0, cellLeft - horizontalBuffer);
        }
        else if (cellLeft + cellWidth > viewportRight) {
            container.scrollLeft = cellLeft + cellWidth - container.clientWidth;
        }
        // Vertical scroll logic
        const verticalBuffer = 25;
        if (cellTop < viewportTop + verticalBuffer) {
            container.scrollTop = Math.max(0, cellTop - verticalBuffer);
        }
        else if (cellTop + cellHeight > viewportBottom) {
            container.scrollTop = cellTop + cellHeight - container.clientHeight;
        }
    }
    updateInputValue(row, col) {
        let oldvalue = this.cellmanager.getCell(row, col)?.value || "";
        ;
        const currentValue = this.cellInput?.value;
        console.log('cellselection handlePointerDown currentValue:', currentValue);
        console.log('cellselection handlePointerDown oldvalue:', oldvalue);
        if (this.activeSelection && currentValue && currentValue !== oldvalue) {
            // this.cellmanager.setCell(
            //     row,
            //     col,
            //     currentValue
            // );
            this.commandpattern?.execute(new celleditcommand(this.cellmanager, row, col, this.cellmanager.getCell(row, col)?.value || "", currentValue, this.griddrawer, this.cellInput));
        }
    }
    updateinputvalue() {
        if (this.cellInput && this.activeSelection) {
            this.cellInput.value = this.cellmanager.getCell(this.activeSelection?.startRow, this.activeSelection?.startCol)?.value?.toString() || "";
        }
    }
}
