/**
 * Represents a single cell in the grid.
 */
var Cell = /** @class */ (function () {
    /**
     * Initializes a Cell object.
     * @param {number} x - X position of the cell
     * @param {number} y - Y position of the cell
     * @param {number} width - Width of the cell
     * @param {number} height - Height of the cell
     * @param {string} [data=""] - Initial content of the cell
     */
    function Cell(x, y, width, height, data) {
        if (data === void 0) { data = ""; }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.data = data;
    }
    /**
     * Draws the cell on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     */
    Cell.prototype.draw = function (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 0.3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";
        console.log(ctx.measureText(this.data));
        // let displaydata = this.data;
        var datawidth = ctx.measureText(this.data).width;
        var ellipse = '';
        var i = 0;
        if (datawidth > this.width) {
            while (ctx.measureText(ellipse).width < (this.width - 8)) {
                ellipse += this.data[i];
                i++;
            }
        }
        ctx.fillText(ellipse, this.x + 4, this.y + this.height / 2);
    };
    return Cell;
}());
/**
 * Manages the grid of cells and canvas interactions.
 */
var GridDrawer = /** @class */ (function () {
    /**
     * Initializes the GridDrawer object.
     * @param {string} canvasId - The ID of the canvas element
     * @param {number} [rows=50] - Number of rows in the grid
     * @param {number} [cols=20] - Number of columns in the grid
     * @param {number} [cellWidth=100] - Width of each cell
     * @param {number} [cellHeight=30] - Height of each cell
     */
    function GridDrawer(canvasId, rows, cols, cellWidth, cellHeight) {
        if (rows === void 0) { rows = 50; }
        if (cols === void 0) { cols = 20; }
        if (cellWidth === void 0) { cellWidth = 100; }
        if (cellHeight === void 0) { cellHeight = 30; }
        /**  Currently selected row index */
        this.selectedRow = 0;
        /**  Currently selected column index */
        this.selectedCol = 0;
        var canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error("Canvas with id \"".concat(canvasId, "\" not found."));
        }
        var context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Failed to get 2D context from canvas.");
        }
        this.canvas = canvas;
        this.ctx = context;
        this.rows = rows;
        this.cols = cols;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.canvas.width = this.cols * this.cellWidth;
        this.canvas.height = this.rows * this.cellHeight;
        this.cells = [];
        this.initializeCells();
        this.attachEvents();
    }
    /**
     * Initializes the grid with Cell objects.
     */
    GridDrawer.prototype.initializeCells = function () {
        for (var row = 0; row < this.rows; row++) {
            var rowCells = [];
            for (var col = 0; col < this.cols; col++) {
                var x = col * this.cellWidth;
                var y = row * this.cellHeight;
                rowCells.push(new Cell(x, y, this.cellWidth, this.cellHeight));
            }
            this.cells.push(rowCells);
        }
    };
    /**
     * Draws the entire grid on the canvas.
     */
    GridDrawer.prototype.drawGrid = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var _i = 0, _a = this.cells; _i < _a.length; _i++) {
            var row = _a[_i];
            for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
                var cell = row_1[_b];
                cell.draw(this.ctx);
            }
        }
    };
    /**
     * Attaches mouse and keyboard event listeners for editing and navigation.
     */
    GridDrawer.prototype.attachEvents = function () {
        var _this = this;
        var input = document.getElementById("cellInput");
        /**
         * Displays the input box over the specified cell.
         * @param {number} row - Row index of the cell
         * @param {number} col - Column index of the cell
         */
        var showInput = function (row, col) {
            var cell = _this.cells[row][col];
            input.style.left = "".concat(cell.x, "px");
            input.style.top = "".concat(cell.y, "px");
            input.style.width = "".concat(cell.width, "px");
            input.style.height = "".concat(cell.height, "px");
            input.value = cell.data;
            input.style.display = "block";
            input.focus();
            input.onblur = function () {
                cell.data = input.value;
                input.style.display = "none";
                _this.ctx.clearRect(cell.x, cell.y, cell.width, cell.height);
                cell.draw(_this.ctx);
            };
        };
        this.canvas.addEventListener("click", function (e) {
            var rect = _this.canvas.getBoundingClientRect();
            console.log(e.clientX);
            console.log(e.clientY);
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            console.log(rect.left);
            console.log(rect.top);
            console.log(x);
            console.log(y);
            _this.selectedCol = Math.floor(x / _this.cellWidth);
            _this.selectedRow = Math.floor(y / _this.cellHeight);
            if (_this.selectedRow < _this.rows && _this.selectedCol < _this.cols) {
                showInput(_this.selectedRow, _this.selectedCol);
            }
        });
        document.addEventListener("keydown", function (e) {
            if (input.style.display === "block") {
                var currentCell = _this.cells[_this.selectedRow][_this.selectedCol];
                currentCell.data = input.value;
                _this.ctx.clearRect(currentCell.x, currentCell.y, currentCell.width, currentCell.height);
                currentCell.draw(_this.ctx);
                switch (e.key) {
                    case "ArrowUp":
                        if (_this.selectedRow > 0)
                            _this.selectedRow--;
                        break;
                    case "ArrowDown":
                        if (_this.selectedRow < _this.rows - 1)
                            _this.selectedRow++;
                        break;
                    case "ArrowLeft":
                        if (_this.selectedCol > 0)
                            _this.selectedCol--;
                        break;
                    case "ArrowRight":
                        if (_this.selectedCol < _this.cols - 1)
                            _this.selectedCol++;
                        break;
                    case "Enter":
                        if (_this.selectedRow < _this.rows - 1)
                            _this.selectedRow++;
                        break;
                    default:
                        return;
                }
                e.preventDefault();
                showInput(_this.selectedRow, _this.selectedCol);
            }
        });
    };
    return GridDrawer;
}());
// Initialize and draw the grid
var grid = new GridDrawer("canvas");
grid.drawGrid();
