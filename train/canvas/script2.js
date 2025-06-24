

/**
 * Represents the main grid component of the spreadsheet
 * Handles the overall layout, rendering, and coordination between components
 */
class Grid {
    /**
     * Initializes the Grid object
     * @param {HTMLCanvasElement} canvas - The canvas element to render on
     * @param {number} rowCount - Number of rows in the grid
     * @param {number} columnCount - Number of columns in the grid
     */
    constructor(canvas, rowCount = 100000, columnCount = 500) {
        /** @type {HTMLCanvasElement} Reference to the canvas element */
        this.canvas = canvas;
        
        /** @type {CanvasRenderingContext2D} The 2D rendering context */
        this.ctx = canvas.getContext('2d');
        
        /** @type {number} Total number of rows */
        this.rowCount = rowCount;
        
        /** @type {number} Total number of columns */
        this.columnCount = columnCount;
        
        /** @type {number} Default row height in pixels */
        this.defaultRowHeight = 24;
        
        /** @type {number} Default column width in pixels */
        this.defaultColumnWidth = 100;
        
        /** @type {Object} Stores custom row heights */
        this.rowHeights = {};
        
        /** @type {Object} Stores custom column widths */
        this.columnWidths = {};
        
        /** @type {CellManager} Manages cell data and formatting */
        this.cellManager = new CellManager(this);
        
        /** @type {SelectionManager} Handles cell selections */
        this.selectionManager = new SelectionManager(this);
        
        /** @type {RenderEngine} Handles the rendering of the grid */
        this.renderEngine = new RenderEngine(this);
        
        /** @type {CommandManager} Manages undo/redo operations */
        this.commandManager = new CommandManager();
        
        /** @type {number} Current horizontal scroll position */
        this.scrollX = 0;
        
        /** @type {number} Current vertical scroll position */
        this.scrollY = 0;
        
        /** @type {number} Width of the visible area */
        this.viewportWidth = canvas.width;
        
        /** @type {number} Height of the visible area */
        this.viewportHeight = canvas.height;
        
        // Initialize event listeners
        this._initializeEventListeners();

        /** @type {number} Pixel width of the entire grid */
        this.totalWidth = this._calculateTotalWidth();
        
        /** @type {number} Pixel height of the entire grid */
        this.totalHeight = this._calculateTotalHeight();
        
        // Initialize the renderer
        this._initializeCanvas();
        this.renderEngine.render(); // ADDED THIS LINE
    }

    /**
     * Initializes event listeners for the grid
     * @private
     */
    _initializeEventListeners() {
        this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this._handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this._handleMouseUp.bind(this));
        this.canvas.addEventListener('dblclick', this._handleDoubleClick.bind(this));
        this.canvas.addEventListener('keydown', this._handleKeyDown.bind(this));
        window.addEventListener('resize', this._handleResize.bind(this));


    }

    _initializeCanvas() {
        // Set canvas dimensions
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        
        // Set crisp rendering for sharp text
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Set default styles
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
    }

    _calculateTotalWidth() {
        let total = this.rowHeaderWidth;
        for (let col = 0; col < this.columnCount; col++) {
            total += this._getColumnWidth(col);
        }
        return total;
    }

    _calculateTotalHeight() {
        let total = this.columnHeaderHeight;
        for (let row = 0; row < this.rowCount; row++) {
            total += this._getRowHeight(row);
        }
        return total;
    
    }

    // Other methods would be implemented here...
}
/**
 * Represents a single cell in the spreadsheet
 */
class Cell {
    /**
     * Initializes a Cell object
     * @param {number} row - The row index of the cell
     * @param {number} column - The column index of the cell
     * @param {Grid} grid - Reference to the parent grid
     */
    constructor(row, column, grid) {
        /** @type {number} The row index of the cell */
        this.row = row;
        
        /** @type {number} The column index of the cell */
        this.column = column;
        
        /** @type {string|number|boolean} The raw value of the cell */
        this.rawValue = '';
        
        /** @type {string} The displayed value of the cell */
        this.displayValue = '';
        
        /** @type {string} The formula of the cell (if any) */
        this.formula = '';
        
        /** @type {Object} Cell formatting options */
        this.format = {
            fontFamily: 'Arial',
            fontSize: 12,
            fontWeight: 'normal',
            fontColor: '#000000',
            backgroundColor: '#FFFFFF',
            textAlign: 'left',
            verticalAlign: 'middle',
            borderTop: null,
            borderRight: null,
            borderBottom: null,
            borderLeft: null
        };
        
        /** @type {Grid} Reference to the parent grid */
        this.grid = grid;
    }

    /**
     * Sets the value of the cell
     * @param {string|number|boolean} value - The value to set
     */
    setValue(value) {
        // Check if value starts with '=' (formula)
        if (typeof value === 'string' && value.startsWith('=')) {
            this.formula = value;
            this._evaluateFormula();
        } else {
            this.rawValue = value;
            this.displayValue = this._formatValue(value);
            this.formula = '';
        }
    }

    /**
     * Formats a raw value for display
     * @param {string|number|boolean} value - The value to format
     * @returns {string} The formatted value
     * @private
     */
    _formatValue(value) {
        if (value === null || value === undefined) return '';
        return value.toString();
    }

    /**
     * Evaluates the cell's formula
     * @private
     */
    _evaluateFormula() {
        try {
            // Simple formula evaluation - in a real implementation, you'd use a proper parser
            const expression = this.formula.substring(1);
            // This is a simplified example - real implementation would need a formula engine
            this.rawValue = eval(expression); // Note: Using eval is dangerous in production!
            this.displayValue = this._formatValue(this.rawValue);
        } catch (e) {
            this.rawValue = '#ERROR';
            this.displayValue = '#ERROR';
        }
    }
}
/**
 * Manages all cells in the grid with optimized storage
 */
class CellManager {
    /**
     * Initializes the CellManager
     * @param {Grid} grid - Reference to the parent grid
     */
    constructor(grid) {
        /** @type {Grid} Reference to the parent grid */
        this.grid = grid;
        
        /** @type {Object} Sparse storage for cell data */
        this.cellData = {};
        
        /** @type {Object} Cache for visible cells */
        this.visibleCells = {};
    }

    /**
     * Gets a cell at the specified coordinates
     * @param {number} row - Row index
     * @param {number} column - Column index
     * @returns {Cell} The cell at the specified position
     */
    getCell(row, column) {
        const cellKey = `${row},${column}`;
        
        // Return from cache if available
        if (this.visibleCells[cellKey]) {
            return this.visibleCells[cellKey];
        }
        
        // Create new cell if not exists
        if (!this.cellData[cellKey]) {
            this.cellData[cellKey] = new Cell(row, column, this.grid);
        }
        
        // Add to visible cache
        this.visibleCells[cellKey] = this.cellData[cellKey];
        
        return this.cellData[cellKey];
    }

    /**
     * Clears the visible cells cache
     */
    clearVisibleCache() {
        this.visibleCells = {};
    }

    /**
     * Sets the value of a cell
     * @param {number} row - Row index
     * @param {number} column - Column index
     * @param {string|number|boolean} value - The value to set
     */
    setCellValue(row, column, value) {
        const cell = this.getCell(row, column);
        cell.setValue(value);
    }
}
/**
 * Manages cell selections in the grid
 */
class SelectionManager {
    /**
     * Initializes the SelectionManager
     * @param {Grid} grid - Reference to the parent grid
     */
    constructor(grid) {
        /** @type {Grid} Reference to the parent grid */
        this.grid = grid;
        
        /** @type {Object|null} Currently selected cell */
        this.selectedCell = null;
        
        /** @type {Object|null} Current selection range */
        this.selectionRange = null;
        
        /** @type {boolean} Flag for column selection */
        this.isColumnSelection = false;
        
        /** @type {boolean} Flag for row selection */
        this.isRowSelection = false;
        
        /** @type {number} Column being resized */
        this.resizingColumn = null;
        
        /** @type {number} Row being resized */
        this.resizingRow = null;
        
        /** @type {number} Initial position for resize operation */
        this.resizeStartPosition = 0;
    }

    /**
     * Selects a single cell
     * @param {number} row - Row index
     * @param {number} column - Column index
     */
    selectCell(row, column) {
        this.selectedCell = { row, column };
        this.selectionRange = null;
        this.isColumnSelection = false;
        this.isRowSelection = false;
        this.grid.renderEngine.render();
    }

    /**
     * Selects a range of cells
     * @param {number} startRow - Start row index
     * @param {number} startColumn - Start column index
     * @param {number} endRow - End row index
     * @param {number} endColumn - End column index
     */
    selectRange(startRow, startColumn, endRow, endColumn) {
        this.selectionRange = {
            startRow: Math.min(startRow, endRow),
            startColumn: Math.min(startColumn, endColumn),
            endRow: Math.max(startRow, endRow),
            endColumn: Math.max(startColumn, endColumn)
        };
        this.selectedCell = null;
        this.isColumnSelection = false;
        this.isRowSelection = false;
        this.grid.renderEngine.render();
    }

    /**
     * Selects an entire column
     * @param {number} column - Column index
     */
    selectColumn(column) {
        this.isColumnSelection = true;
        this.selectedColumn = column;
        this.selectedCell = null;
        this.selectionRange = {
            startRow: 0,
            startColumn: column,
            endRow: this.grid.rowCount - 1,
            endColumn: column
        };
        this.grid.renderEngine.render();
    }

    /**
     * Selects an entire row
     * @param {number} row - Row index
     */
    selectRow(row) {
        this.isRowSelection = true;
        this.selectedRow = row;
        this.selectedCell = null;
        this.selectionRange = {
            startRow: row,
            startColumn: 0,
            endRow: row,
            endColumn: this.grid.columnCount - 1
        };
        this.grid.renderEngine.render();
    }
}
/**
 * Handles rendering of the grid and its components
 */
class RenderEngine {
    /**
     * Initializes the RenderEngine
     * @param {Grid} grid - Reference to the parent grid
     */
    constructor(grid) {
        /** @type {Grid} Reference to the parent grid */
        this.grid = grid;
        
        /** @type {number} Width of the row headers */
        this.rowHeaderWidth = 50;
        
        /** @type {number} Height of the column headers */
        this.columnHeaderHeight = 24;
        
        /** @type {Object} Cached measurements */
        this.measureCache = {};

        /** @type {number} Number of visible rows */
        this.visibleRowCount = 0;
        
        /** @type {number} Number of visible columns */
        this.visibleColumnCount = 0;
    }

    render() {
        const { ctx, canvas } = this.grid;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate visible area
        this._calculateVisibleArea();
        
        // Draw grid background
        this._drawGridBackground();
        
        // Draw headers
        this._drawColumnHeaders();
        this._drawRowHeaders();
        
        // Draw cells
        this._drawCells();
        
        // Draw selection
        this._drawSelection();
    }

    _calculateVisibleArea() {
        const { scrollX, scrollY, viewportWidth, viewportHeight } = this.grid;
        
        // Calculate first/last visible columns
        let x = this.rowHeaderWidth;
        this.firstVisibleCol = 0;
        this.lastVisibleCol = 0;
        
        for (let col = 0; col < this.grid.columnCount; col++) {
            const width = this.grid._getColumnWidth(col);
            if (x + width > scrollX && x < scrollX + viewportWidth) {
                if (this.firstVisibleCol === 0) this.firstVisibleCol = col;
                this.lastVisibleCol = col;
            }
            x += width;
        }
        
        // Calculate first/last visible rows
        let y = this.columnHeaderHeight;
        this.firstVisibleRow = 0;
        this.lastVisibleRow = 0;
        
        for (let row = 0; row < this.grid.rowCount; row++) {
            const height = this.grid._getRowHeight(row);
            if (y + height > scrollY && y < scrollY + viewportHeight) {
                if (this.firstVisibleRow === 0) this.firstVisibleRow = row;
                this.lastVisibleRow = row;
            }
            y += height;
        }
    }

    _drawGridBackground() {
        const { ctx, canvas } = this.grid;
        
        // Fill entire canvas with default background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    _drawColumnHeaders() {
        const { ctx } = this.grid;
        const startX = this.rowHeaderWidth - this.grid.scrollX;
        
        ctx.fillStyle = '#F1F1F1';
        ctx.fillRect(0, 0, this.grid.viewportWidth, this.columnHeaderHeight);
        
        ctx.strokeStyle = '#D0D0D0';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, this.grid.viewportWidth - 1, this.columnHeaderHeight - 1);
        
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let x = startX;
        for (let col = this.firstVisibleCol; col <= this.lastVisibleCol; col++) {
            const width = this.grid._getColumnWidth(col);
            
            if (x + width > 0) { // Only draw if visible
                ctx.fillText(
                    String.fromCharCode(65 + (col % 26)) + (col >= 26 ? Math.floor(col / 26) : ''),
                    x + width / 2,
                    this.columnHeaderHeight / 2
                );
                
                // Draw right border
                ctx.strokeStyle = '#D0D0D0';
                ctx.beginPath();
                ctx.moveTo(x + width - 0.5, 0);
                ctx.lineTo(x + width - 0.5, this.columnHeaderHeight);
                ctx.stroke();
            }
            
            x += width;
        }
    }

    _drawRowHeaders() {
        const { ctx } = this.grid;
        const startY = this.columnHeaderHeight - this.grid.scrollY;
        
        ctx.fillStyle = '#F1F1F1';
        ctx.fillRect(0, this.columnHeaderHeight, this.rowHeaderWidth, this.grid.viewportHeight - this.columnHeaderHeight);
        
        ctx.strokeStyle = '#D0D0D0';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, this.columnHeaderHeight + 0.5, this.rowHeaderWidth - 1, this.grid.viewportHeight - this.columnHeaderHeight - 1);
        
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let y = startY;
        for (let row = this.firstVisibleRow; row <= this.lastVisibleRow; row++) {
            const height = this.grid._getRowHeight(row);
            
            if (y + height > this.columnHeaderHeight) { // Only draw if visible
                ctx.fillText(
                    (row + 1).toString(),
                    this.rowHeaderWidth / 2,
                    y + height / 2
                );
                
                // Draw bottom border
                ctx.strokeStyle = '#D0D0D0';
                ctx.beginPath();
                ctx.moveTo(0, y + height - 0.5);
                ctx.lineTo(this.rowHeaderWidth, y + height - 0.5);
                ctx.stroke();
            }
            
            y += height;
        }
    }

    _drawCells() {
        const { ctx } = this.grid;
        const startX = this.rowHeaderWidth - this.grid.scrollX;
        const startY = this.columnHeaderHeight - this.grid.scrollY;
        
        let y = startY;
        for (let row = this.firstVisibleRow; row <= this.lastVisibleRow; row++) {
            const rowHeight = this.grid._getRowHeight(row);
            
            let x = startX;
            for (let col = this.firstVisibleCol; col <= this.lastVisibleCol; col++) {
                const colWidth = this.grid._getColumnWidth(col);
                
                // Only draw if visible in viewport
                if (x + colWidth > 0 && y + rowHeight > this.columnHeaderHeight && 
                    x < this.grid.viewportWidth && y < this.grid.viewportHeight) {
                    
                    const cell = this.grid.cellManager.getCell(row, col);
                    
                    // Draw cell background
                    ctx.fillStyle = cell.format.backgroundColor || '#FFFFFF';
                    ctx.fillRect(x, y, colWidth, rowHeight);
                    
                    // Draw cell borders
                    ctx.strokeStyle = '#E0E0E0';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x + 0.5, y + 0.5, colWidth - 1, rowHeight - 1);
                    
                    // Draw cell text
                    if (cell.displayValue) {
                        ctx.fillStyle = cell.format.fontColor || '#000000';
                        ctx.font = `${cell.format.fontWeight || 'normal'} ${cell.format.fontSize || 12}px ${cell.format.fontFamily || 'Arial'}`;
                        ctx.textAlign = cell.format.textAlign || 'left';
                        
                        const textX = cell.format.textAlign === 'center' ? x + colWidth / 2 :
                                     cell.format.textAlign === 'right' ? x + colWidth - 4 : x + 4;
                        
                        const textY = y + rowHeight / 2;
                        
                        ctx.fillText(cell.displayValue, textX, textY);
                    }
                }
                
                x += colWidth;
            }
            
            y += rowHeight;
        }
    }

    // Other rendering methods would be implemented here...
}
/**
 * Base command class for implementing the command pattern
 */
class Command {
    /**
     * Executes the command
     * @abstract
     */
    execute() {
        throw new Error('Method "execute" must be implemented.');
    }

    /**
     * Undoes the command
     * @abstract
     */
    undo() {
        throw new Error('Method "undo" must be implemented.');
    }
}

/**
 * Command for setting cell values
 */
class SetCellValueCommand extends Command {
    /**
     * Initializes the SetCellValueCommand
     * @param {Grid} grid - Reference to the grid
     * @param {number} row - Row index
     * @param {number} column - Column index
     * @param {string|number} newValue - The new value to set
     * @param {string|number} oldValue - The previous value
     */
    constructor(grid, row, column, newValue, oldValue) {
        super();
        this.grid = grid;
        this.row = row;
        this.column = column;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }

    /**
     * Executes the command (sets the new value)
     */
    execute() {
        this.grid.cellManager.setCellValue(this.row, this.column, this.newValue);
    }

    /**
     * Undoes the command (restores the old value)
     */
    undo() {
        this.grid.cellManager.setCellValue(this.row, this.column, this.oldValue);
    }
}

/**
 * Manages the command history for undo/redo functionality
 */
class CommandManager {
    /**
     * Initializes the CommandManager
     */
    constructor() {
        /** @type {Command[]} Command history stack */
        this.history = [];
        
        /** @type {number} Current position in the history stack */
        this.currentIndex = -1;
        
        /** @type {number} Maximum number of commands to keep in history */
        this.maxHistorySize = 100;
    }

    /**
     * Executes a command and adds it to the history
     * @param {Command} command - The command to execute
     */
    execute(command) {
        // If we're not at the end of the history, truncate the future history
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        // Execute the command
        command.execute();
        
        // Add to history
        this.history.push(command);
        this.currentIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    /**
     * Undoes the last command
     */
    undo() {
        if (this.currentIndex >= 0) {
            this.history[this.currentIndex].undo();
            this.currentIndex--;
        }
    }

    /**
     * Redoes the last undone command
     */
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.history[this.currentIndex].execute();
        }
    }
}
/**
 * Handles loading and parsing of JSON data into the grid
 */
class DataLoader {
    /**
     * Initializes the DataLoader
     * @param {Grid} grid - Reference to the grid
     */
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Loads JSON data into the grid
     * @param {Object[]} data - Array of JSON objects
     * @param {number} [startRow=0] - Starting row index
     */
    loadJSONData(data, startRow = 0) {
        if (!data || !data.length) return;
        
        // Get all property names (columns) from the first object
        const columns = Object.keys(data[0]);
        const columnMap = {};
        
        // Map property names to column indices
        columns.forEach((col, index) => {
            columnMap[col] = index;
        });
        
        // Load data into cells
        data.forEach((item, rowIndex) => {
            columns.forEach(col => {
                const value = item[col];
                this.grid.cellManager.setCellValue(
                    startRow + rowIndex,
                    columnMap[col],
                    value
                );
            });
        });
        
        // Trigger a re-render
        this.grid.renderEngine.render();
    }

    /**
     * Generates sample data for testing
     * @param {number} count - Number of records to generate
     * @returns {Object[]} Generated data
     */
    static generateSampleData(count = 50000) {
        const firstNames = ['Raj', 'Priya', 'Amit', 'Neha', 'Vikram', 'Anjali', 'Sanjay', 'Meera'];
        const lastNames = ['Solanki', 'Patel', 'Sharma', 'Gupta', 'Singh', 'Verma', 'Reddy', 'Malhotra'];
        const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
        
        const data = [];
        
        for (let i = 0; i < count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const age = Math.floor(Math.random() * 40) + 20;
            const salary = Math.floor(Math.random() * 150000) + 50000;
            const department = departments[Math.floor(Math.random() * departments.length)];
            
            data.push({
                id: i + 1,
                firstName,
                lastName,
                age,
                salary,
                department,
                joinDate: new Date(2010 + Math.floor(Math.random() * 10), 
                          Math.floor(Math.random() * 12), 
                          Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
            });
        }
        
        return data;
    }
}
/**
 * Handles statistical calculations for selected cells
 */
class StatsCalculator {
    /**
     * Initializes the StatsCalculator
     * @param {Grid} grid - Reference to the grid
     */
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Calculates statistics for the current selection
     * @returns {Object} Statistics object
     */
    calculateSelectionStats() {
        const selection = this.grid.selectionManager.selectionRange;
        if (!selection) return null;
        
        const stats = {
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity,
            numericCount: 0,
            average: null
        };
        
        // Iterate through selected cells
        for (let row = selection.startRow; row <= selection.endRow; row++) {
            for (let col = selection.startColumn; col <= selection.endColumn; col++) {
                const cell = this.grid.cellManager.getCell(row, col);
                const value = cell.rawValue;
                stats.count++;
                
                // Check if value is numeric
                if (typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(value))) {
                    const numValue = parseFloat(value);
                    stats.numericCount++;
                    stats.sum += numValue;
                    stats.min = Math.min(stats.min, numValue);
                    stats.max = Math.max(stats.max, numValue);
                }
            }
        }
        
        // Calculate average if we have numeric values
        if (stats.numericCount > 0) {
            stats.average = stats.sum / stats.numericCount;
        } else {
            stats.min = null;
            stats.max = null;
            stats.sum = null;
        }
        
        return stats;
    }

    /**
     * Displays statistics in the UI
     * @param {HTMLElement} element - The element to display stats in
     */
    displayStats(element) {
        const stats = this.calculateSelectionStats();
        if (!stats) {
            element.textContent = 'No selection';
            return;
        }
        
        let html = `<div>Count: ${stats.count}</div>`;
        
        if (stats.numericCount > 0) {
            html += `
                <div>Numeric Count: ${stats.numericCount}</div>
                <div>Sum: ${stats.sum.toFixed(2)}</div>
                <div>Min: ${stats.min.toFixed(2)}</div>
                <div>Max: ${stats.max.toFixed(2)}</div>
                <div>Average: ${stats.average.toFixed(2)}</div>
            `;
        } else {
            html += '<div>No numeric values in selection</div>';
        }
        
        element.innerHTML = html;
    }
}
/**
 * Main application class that ties everything together
 */
class ExcelCloneApp {
    constructor(canvasId, statsContainerId) {
        this.canvas = document.getElementById(canvasId);
        this.statsContainer = document.getElementById(statsContainerId);
        
        // Ensure canvas is properly sized
        this._resizeCanvas();
        
        // Initialize grid with proper dimensions
        this.grid = new Grid(this.canvas);
        
        // Load sample data
        this._loadSampleData();
        
        // Initialize UI
        this._initializeUI();
        
        // Force initial render
        this.grid.renderEngine.render();
    }

    _resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Update grid viewport dimensions
        if (this.grid) {
            this.grid.viewportWidth = this.canvas.width;
            this.grid.viewportHeight = this.canvas.height;
        }
    }

    _loadSampleData() {
        // Create some sample data to make the grid visible
        const sampleData = [
            { A: "Name", B: "Age", C: "Department", D: "Salary" },
            { A: "John Doe", B: 32, C: "Engineering", D: 85000 },
            { A: "Jane Smith", B: 28, C: "Marketing", D: 72000 },
            { A: "Mike Johnson", B: 41, C: "Sales", D: 68000 },
            { A: "Sarah Williams", B: 35, C: "HR", D: 65000 }
        ];
        
        this.grid.dataLoader.loadJSONData(sampleData);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ExcelCloneApp('excelCanvas', 'statsContainer');
    
    // Handle window resize
    window.addEventListener('resize', () => {
        app._resizeCanvas();
        app.grid.renderEngine.render();
    });
});

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ExcelCloneApp('excelCanvas', 'statsContainer');
});