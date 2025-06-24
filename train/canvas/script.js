/**
 * Complete Excel Clone with Microsoft Excel-like functionality
 */
class ExcelClone {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configuration options
        this.options = {
            rowCount: 100000,
            colCount: 500,
            defaultRowHeight: 20,
            defaultColWidth: 80,
            headerHeight: 24,
            headerWidth: 50,
            minColWidth: 10,
            minRowHeight: 10,
            scrollbarSize: 17,
            zoomLevel: 100,
            ...options
        };
        
        // Grid data
        this.grid = new Grid(this.options.rowCount, this.options.colCount);
        
        // Selection management
        this.selectionManager = new SelectionManager();
        
        // Command pattern for undo/redo
        this.commandManager = new CommandManager();
        
        // Scroll state
        this.scrollX = 0;
        this.scrollY = 0;
        this.maxScrollX = 0;
        this.maxScrollY = 0;
        
        // Resize state
        this.isResizingCol = false;
        this.isResizingRow = false;
        this.resizeColIndex = -1;
        this.resizeRowIndex = -1;
        this.startResizeX = 0;
        this.startResizeY = 0;
        this.startColWidth = 0;
        this.startRowHeight = 0;
        
        // Editing state
        this.editingCell = null;
        this.textInput = document.getElementById('formula-input');
        this.nameBox = document.getElementById('name-box');
        
        // Mouse state
        this.isMouseDown = false;
        this.mouseDownCell = null;
        this.isDragging = false;
        
        // Initialize
        this.initCanvas();
        this.initEventListeners();
        this.initScrollbars();
        this.resizeCanvas();
        this.render();
    }
    
    initCanvas() {
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
    }
    
    initEventListeners() {
        // Window events
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.updateScrollbars();
            this.render();
        });
        
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Text input events
        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.finishEditing();
            } else if (e.key === 'Escape') {
                this.cancelEditing();
            } else if (e.key === 'Tab') {
                this.handleTabKey(e);
            }
        });
        
        this.textInput.addEventListener('blur', () => {
            this.finishEditing();
        });
        
        // Toolbar buttons
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());
        document.getElementById('load-data-btn').addEventListener('click', () => this.loadSampleData());
        document.getElementById('cut-btn').addEventListener('click', () => this.cut());
        document.getElementById('copy-btn').addEventListener('click', () => this.copy());
        document.getElementById('paste-btn').addEventListener('click', () => this.paste());
        document.getElementById('bold-btn').addEventListener('click', () => this.toggleBold());
        document.getElementById('italic-btn').addEventListener('click', () => this.toggleItalic());
        document.getElementById('underline-btn').addEventListener('click', () => this.toggleUnderline());
        
        // Alignment buttons
        document.getElementById('align-left-btn').addEventListener('click', () => this.setAlignment('left'));
        document.getElementById('align-center-btn').addEventListener('click', () => this.setAlignment('center'));
        document.getElementById('align-right-btn').addEventListener('click', () => this.setAlignment('right'));
        
        // Number formatting
        document.getElementById('format-number-btn').addEventListener('click', () => this.setNumberFormat('number'));
        document.getElementById('format-percent-btn').addEventListener('click', () => this.setNumberFormat('percent'));
        document.getElementById('format-currency-btn').addEventListener('click', () => this.setNumberFormat('currency'));
        
        // Stats buttons
        document.getElementById('sum-btn').addEventListener('click', () => this.calculateSelected('sum'));
        document.getElementById('avg-btn').addEventListener('click', () => this.calculateSelected('avg'));
        document.getElementById('min-btn').addEventListener('click', () => this.calculateSelected('min'));
        document.getElementById('max-btn').addEventListener('click', () => this.calculateSelected('max'));
        document.getElementById('count-btn').addEventListener('click', () => this.calculateSelected('count'));
        
        // Zoom controls
        document.getElementById('zoom-in-btn').addEventListener('click', () => this.adjustZoom(10));
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.adjustZoom(-10));
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ribbon').forEach(r => r.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`${tab.textContent.toLowerCase()}-ribbon`).classList.add('active');
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'z': this.undo(); break;
                    case 'y': this.redo(); break;
                    case 'x': this.cut(); break;
                    case 'c': this.copy(); break;
                    case 'v': this.paste(); break;
                    case 'b': this.toggleBold(); break;
                    case 'i': this.toggleItalic(); break;
                    case 'u': this.toggleUnderline(); break;
                }
            } else if (!this.editingCell) {
                switch (e.key) {
                    case 'ArrowUp': 
                    case 'ArrowDown': 
                    case 'ArrowLeft': 
                    case 'ArrowRight': 
                        this.handleArrowKeys(e); 
                        e.preventDefault(); 
                        break;
                    case 'F2': 
                        this.startEditingCurrentCell(); 
                        e.preventDefault(); 
                        break;
                    case 'Enter': 
                        this.moveSelectionAfterEnter(); 
                        e.preventDefault(); 
                        break;
                    case 'Tab': 
                        this.handleTabKey(e); 
                        e.preventDefault(); 
                        break;
                    case 'Delete': 
                        this.clearSelectedCells(); 
                        e.preventDefault(); 
                        break;
                }
            }
        });
    }
    
    initScrollbars() {
        const verticalScrollbar = document.getElementById('vertical-scrollbar');
        const horizontalScrollbar = document.getElementById('horizontal-scrollbar');
        
        // Create scrollbar content elements
        const verticalContent = document.createElement('div');
        verticalContent.style.height = `${this.options.rowCount * this.options.defaultRowHeight}px`;
        verticalScrollbar.appendChild(verticalContent);
        
        const horizontalContent = document.createElement('div');
        horizontalContent.style.width = `${this.options.colCount * this.options.defaultColWidth}px`;
        horizontalScrollbar.appendChild(horizontalContent);
        
        // Set up vertical scrollbar
        verticalScrollbar.addEventListener('scroll', () => {
            this.scrollY = verticalScrollbar.scrollTop;
            this.render();
        });
        
        // Set up horizontal scrollbar
        horizontalScrollbar.addEventListener('scroll', () => {
            this.scrollX = horizontalScrollbar.scrollLeft;
            this.render();
        });
    }
    
    updateScrollbars() {
        const verticalScrollbar = document.getElementById('vertical-scrollbar');
        const horizontalScrollbar = document.getElementById('horizontal-scrollbar');
        
        // Calculate content dimensions
        const totalWidth = this.options.colCount * this.options.defaultColWidth;
        const totalHeight = this.options.rowCount * this.options.defaultRowHeight;
        
        // Update vertical scrollbar
        verticalScrollbar.firstChild.style.height = `${totalHeight}px`;
        verticalScrollbar.style.height = `${this.canvas.height - this.options.scrollbarSize}px`;
        
        // Update horizontal scrollbar
        horizontalScrollbar.firstChild.style.width = `${totalWidth}px`;
        horizontalScrollbar.style.width = `${this.canvas.width - this.options.scrollbarSize}px`;
        
        // Update max scroll values
        this.maxScrollX = Math.max(0, totalWidth - this.canvas.width + this.options.headerWidth);
        this.maxScrollY = Math.max(0, totalHeight - this.canvas.height + this.options.headerHeight);
    }
    
    resizeCanvas() {
        const container = document.getElementById('grid-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Set canvas size
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update scrollbars
        this.updateScrollbars();
        
        this.render();
    }
    
    adjustZoom(delta) {
        this.options.zoomLevel = Math.max(10, Math.min(400, this.options.zoomLevel + delta));
        document.getElementById('zoom-level').textContent = `${this.options.zoomLevel}%`;
        
        // Adjust row heights and column widths based on zoom
        const zoomFactor = this.options.zoomLevel / 100;
        this.options.defaultRowHeight = Math.max(this.options.minRowHeight, Math.round(20 * zoomFactor));
        this.options.defaultColWidth = Math.max(this.options.minColWidth, Math.round(80 * zoomFactor));
        
        this.updateScrollbars();
        this.render();
    }
    
    handleMouseDown(e) {
        e.preventDefault();
        this.isMouseDown = true;
        
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Check for column resize
        if (mouseY <= headerHeight && mouseX > headerWidth) {
            const col = Math.floor((mouseX - headerWidth + this.scrollX) / defaultColWidth);
            const colX = headerWidth + col * defaultColWidth - this.scrollX;
            
            if (Math.abs(mouseX - (colX + defaultColWidth)) < 5) {
                this.isResizingCol = true;
                this.resizeColIndex = col;
                this.startResizeX = mouseX;
                this.startColWidth = defaultColWidth;
                return;
            }
        }
        
        // Check for row resize
        if (mouseX <= headerWidth && mouseY > headerHeight) {
            const row = Math.floor((mouseY - headerHeight + this.scrollY) / defaultRowHeight);
            const rowY = headerHeight + row * defaultRowHeight - this.scrollY;
            
            if (Math.abs(mouseY - (rowY + defaultRowHeight)) < 5) {
                this.isResizingRow = true;
                this.resizeRowIndex = row;
                this.startResizeY = mouseY;
                this.startRowHeight = defaultRowHeight;
                return;
            }
        }
        
        // Check if click is in the grid area
        if (mouseX > headerWidth && mouseY > headerHeight) {
            const col = Math.floor((mouseX - headerWidth + this.scrollX) / defaultColWidth);
            const row = Math.floor((mouseY - headerHeight + this.scrollY) / defaultRowHeight);
            
            this.mouseDownCell = { row, col };
            
            // Check if we're clicking on an already selected cell
            const currentSelection = this.selectionManager.getSelection();
            const isSelected = currentSelection && 
                ((currentSelection instanceof CellReference && 
                  currentSelection.row === row && 
                  currentSelection.col === col) ||
                 (currentSelection instanceof CellRange && 
                  currentSelection.contains(row, col)));
            
            if (isSelected) {
                // Prepare for possible drag operation
                this.isDragging = false;
            } else {
                // New selection
                this.selectCell(row, col, e.shiftKey);
            }
            
            // Start editing if it's a single click on an already selected cell
            if (isSelected && !e.shiftKey) {
                this.startEditing(row, col);
            }
        }
    }
    
    handleMouseMove(e) {
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth, minColWidth, minRowHeight } = this.options;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Handle column resizing
        if (this.isResizingCol) {
            const newWidth = Math.max(minColWidth, this.startColWidth + (mouseX - this.startResizeX));
            this.options.defaultColWidth = newWidth;
            this.updateScrollbars();
            this.render();
            return;
        }
        
        // Handle row resizing
        if (this.isResizingRow) {
            const newHeight = Math.max(minRowHeight, this.startRowHeight + (mouseY - this.startResizeY));
            this.options.defaultRowHeight = newHeight;
            this.updateScrollbars();
            this.render();
            return;
        }
        
        // Handle cell dragging for selection
        if (this.isMouseDown && this.mouseDownCell) {
            const col = Math.floor((mouseX - headerWidth + this.scrollX) / defaultColWidth);
            const row = Math.floor((mouseY - headerHeight + this.scrollY) / defaultRowHeight);
            
            // Only start dragging after moving a few pixels
            if (!this.isDragging && 
                (Math.abs(mouseX - (this.mouseDownCell.col * defaultColWidth + headerWidth - this.scrollX)) > 3 || 
                Math.abs(mouseY - (this.mouseDownCell.row * defaultRowHeight + headerHeight - this.scrollY)) > 3)) {
                this.isDragging = true;
                this.cancelEditing();
            }
            
            if (this.isDragging) {
                this.selectRange(this.mouseDownCell.row, this.mouseDownCell.col, row, col);
            }
        }
        
        // Show resize cursor when hovering over resize areas
        if (mouseY <= headerHeight && mouseX > headerWidth) {
            const col = Math.floor((mouseX - headerWidth + this.scrollX) / defaultColWidth);
            const colX = headerWidth + col * defaultColWidth - this.scrollX;
            
            if (Math.abs(mouseX - (colX + defaultColWidth)) < 5) {
                this.canvas.style.cursor = 'col-resize';
                return;
            }
        }
        
        if (mouseX <= headerWidth && mouseY > headerHeight) {
            const row = Math.floor((mouseY - headerHeight + this.scrollY) / defaultRowHeight);
            const rowY = headerHeight + row * defaultRowHeight - this.scrollY;
            
            if (Math.abs(mouseY - (rowY + defaultRowHeight)) < 5) {
                this.canvas.style.cursor = 'row-resize';
                return;
            }
        }
        
        this.canvas.style.cursor = 'default';
    }
    
    handleMouseUp(e) {
        if (this.isMouseDown && !this.isDragging && this.mouseDownCell) {
            const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const col = Math.floor((mouseX - headerWidth + this.scrollX) / defaultColWidth);
            const row = Math.floor((mouseY - headerHeight + this.scrollY) / defaultRowHeight);
            
            // Check if it's the same cell (not a drag)
            if (this.mouseDownCell.row === row && this.mouseDownCell.col === col) {
                const currentSelection = this.selectionManager.getSelection();
                const isSelected = currentSelection && 
                    ((currentSelection instanceof CellReference && 
                      currentSelection.row === row && 
                      currentSelection.col === col) ||
                     (currentSelection instanceof CellRange && 
                      currentSelection.contains(row, col)));
                
                if (isSelected && !e.shiftKey) {
                    this.startEditing(row, col);
                }
            }
        }
        
        this.isMouseDown = false;
        this.isDragging = false;
        this.isResizingCol = false;
        this.isResizingRow = false;
        this.mouseDownCell = null;
        this.canvas.style.cursor = 'default';
    }
    
    handleDoubleClick(e) {
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (mouseX > headerWidth && mouseY > headerHeight) {
            const col = Math.floor((mouseX - headerWidth + this.scrollX) / defaultColWidth);
            const row = Math.floor((mouseY - headerHeight + this.scrollY) / defaultRowHeight);
            
            this.selectCell(row, col);
            this.startEditing(row, col);
        }
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        // Update scroll position
        const verticalScrollbar = document.getElementById('vertical-scrollbar');
        const horizontalScrollbar = document.getElementById('horizontal-scrollbar');
        
        // Horizontal scrolling
        if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            horizontalScrollbar.scrollLeft += e.deltaY;
        } 
        // Vertical scrolling
        else {
            verticalScrollbar.scrollTop += e.deltaY;
        }
    }
    
    handleArrowKeys(e) {
        if (this.editingCell) return;
        
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        let newRow, newCol;
        
        if (selection instanceof CellReference) {
            newRow = selection.row;
            newCol = selection.col;
        } else if (selection instanceof CellRange) {
            newRow = selection.endRow;
            newCol = selection.endCol;
        }
        
        switch (e.key) {
            case 'ArrowUp':
                newRow = Math.max(0, newRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(this.options.rowCount - 1, newRow + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, newCol - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(this.options.colCount - 1, newCol + 1);
                break;
        }
        
        if (e.shiftKey && selection instanceof CellRange) {
            this.selectRange(selection.startRow, selection.startCol, newRow, newCol);
        } else {
            this.selectCell(newRow, newCol);
            this.ensureCellVisible(newRow, newCol);
        }
    }
    
    handleTabKey(e) {
        if (this.editingCell) {
            // If editing, Tab should finish editing and move to next cell
            this.finishEditing();
            
            const selection = this.selectionManager.getSelection();
            if (selection) {
                let row, col;
                
                if (selection instanceof CellReference) {
                    row = selection.row;
                    col = selection.col;
                } else if (selection instanceof CellRange) {
                    row = selection.endRow;
                    col = selection.endCol;
                }
                
                if (e.shiftKey) {
                    col = Math.max(0, col - 1);
                } else {
                    col = Math.min(this.options.colCount - 1, col + 1);
                }
                
                this.selectCell(row, col);
                this.ensureCellVisible(row, col);
            }
        } else {
            // If not editing, just move selection
            const selection = this.selectionManager.getSelection();
            if (selection) {
                let row, col;
                
                if (selection instanceof CellReference) {
                    row = selection.row;
                    col = selection.col;
                } else if (selection instanceof CellRange) {
                    row = selection.endRow;
                    col = selection.endCol;
                }
                
                if (e.shiftKey) {
                    col = Math.max(0, col - 1);
                } else {
                    col = Math.min(this.options.colCount - 1, col + 1);
                }
                
                this.selectCell(row, col);
                this.ensureCellVisible(row, col);
            }
        }
        
        e.preventDefault();
    }
    
    moveSelectionAfterEnter() {
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        let row, col;
        
        if (selection instanceof CellReference) {
            row = selection.row + 1;
            col = selection.col;
        } else if (selection instanceof CellRange) {
            row = selection.endRow + 1;
            col = selection.endCol;
        }
        
        if (row >= this.options.rowCount) {
            row = 0;
            col = Math.min(this.options.colCount - 1, col + 1);
        }
        
        this.selectCell(row, col);
        this.ensureCellVisible(row, col);
    }
    
    ensureCellVisible(row, col) {
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        
        // Calculate cell position
        const cellTop = row * defaultRowHeight;
        const cellBottom = cellTop + defaultRowHeight;
        const cellLeft = col * defaultColWidth;
        const cellRight = cellLeft + defaultColWidth;
        
        // Calculate visible area
        const visibleTop = this.scrollY;
        const visibleBottom = visibleTop + this.canvas.height - headerHeight;
        const visibleLeft = this.scrollX;
        const visibleRight = visibleLeft + this.canvas.width - headerWidth;
        
        // Adjust vertical scroll if needed
        if (cellTop < visibleTop) {
            this.scrollY = cellTop;
        } else if (cellBottom > visibleBottom) {
            this.scrollY = cellBottom - (this.canvas.height - headerHeight);
        }
        
        // Adjust horizontal scroll if needed
        if (cellLeft < visibleLeft) {
            this.scrollX = cellLeft;
        } else if (cellRight > visibleRight) {
            this.scrollX = cellRight - (this.canvas.width - headerWidth);
        }
        
        // Update scrollbars
        document.getElementById('vertical-scrollbar').scrollTop = this.scrollY;
        document.getElementById('horizontal-scrollbar').scrollLeft = this.scrollX;
        
        this.render();
    }
    
    selectCell(row, col, extendSelection = false) {
        if (extendSelection && this.selectionManager.hasSelection()) {
            const currentSelection = this.selectionManager.getSelection();
            
            if (currentSelection instanceof CellReference) {
                this.selectionManager.setSelection(
                    new CellRange(
                        currentSelection.row,
                        currentSelection.col,
                        row,
                        col
                    )
                );
            } else if (currentSelection instanceof CellRange) {
                this.selectionManager.setSelection(
                    new CellRange(
                        currentSelection.startRow,
                        currentSelection.startCol,
                        row,
                        col
                    )
                );
            }
        } else {
            this.selectionManager.setSelection(new CellReference(row, col));
        }
        
        this.updateNameBox();
        this.updateFormulaInput();
        this.render();
    }
    
    selectRange(startRow, startCol, endRow, endCol) {
        this.selectionManager.setSelection(
            new CellRange(
                Math.min(startRow, endRow),
                Math.min(startCol, endCol),
                Math.max(startRow, endRow),
                Math.max(startCol, endCol)
            )
        );
        
        this.updateNameBox();
        this.updateFormulaInput();
        this.render();
    }
    
    startEditing(row, col) {
        this.cancelEditing();
        
        const cell = this.grid.getCell(row, col);
        this.editingCell = { row, col };
        
        this.textInput.value = cell ? cell.value || '' : '';
        this.textInput.focus();
        this.textInput.select();
        
        this.render();
    }
    
    startEditingCurrentCell() {
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        if (selection instanceof CellReference) {
            this.startEditing(selection.row, selection.col);
        } else if (selection instanceof CellRange) {
            this.startEditing(selection.startRow, selection.startCol);
        }
    }
    
    finishEditing() {
        if (!this.editingCell) return;
        
        const { row, col } = this.editingCell;
        const newValue = this.textInput.value;
        
        const command = new SetCellValueCommand(
            this.grid,
            row,
            col,
            newValue
        );
        this.commandManager.execute(command);
        
        this.cancelEditing();
        this.render();
    }
    
    cancelEditing() {
        this.editingCell = null;
    }
    
    updateNameBox() {
        const selection = this.selectionManager.getSelection();
        if (!selection) {
            this.nameBox.textContent = '';
            return;
        }
        
        if (selection instanceof CellReference) {
            this.nameBox.textContent = this.getCellAddress(selection.row, selection.col);
        } else if (selection instanceof CellRange) {
            this.nameBox.textContent = `${this.getCellAddress(selection.startRow, selection.startCol)}:${this.getCellAddress(selection.endRow, selection.endCol)}`;
        }
    }
    
    updateFormulaInput() {
        const selection = this.selectionManager.getSelection();
        if (!selection) {
            this.textInput.value = '';
            return;
        }
        
        let cell;
        if (selection instanceof CellReference) {
            cell = this.grid.getCell(selection.row, selection.col);
        } else if (selection instanceof CellRange) {
            cell = this.grid.getCell(selection.startRow, selection.startCol);
        }
        
        this.textInput.value = cell ? cell.value || '' : '';
    }
    
    getCellAddress(row, col) {
        const colName = this.getColName(col);
        return `${colName}${row + 1}`;
    }
    
    getColName(col) {
        let name = '';
        let remaining = col;
        
        do {
            name = String.fromCharCode(65 + (remaining % 26)) + name;
            remaining = Math.floor(remaining / 26) - 1;
        } while (remaining >= 0);
        
        return name;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render grid
        this.renderHeaders();
        this.renderCells();
        this.renderSelection();
    }
    
    renderHeaders() {
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        
        // Draw corner
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, headerWidth, headerHeight);
        this.ctx.strokeStyle = '#d4d4d4';
        this.ctx.strokeRect(0, 0, headerWidth, headerHeight);
        
        // Draw column headers
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '12px Arial';
        
        const startCol = Math.floor(this.scrollX / defaultColWidth);
        const endCol = Math.min(startCol + Math.ceil(this.canvas.width / defaultColWidth) + 1, this.grid.colCount);
        
        for (let col = startCol; col < endCol; col++) {
            const x = headerWidth + (col - startCol) * defaultColWidth - (this.scrollX % defaultColWidth);
            
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fillRect(x, 0, defaultColWidth, headerHeight);
            this.ctx.strokeStyle = '#d4d4d4';
            this.ctx.strokeRect(x, 0, defaultColWidth, headerHeight);
            
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(this.getColName(col), x + defaultColWidth / 2, headerHeight / 2);
        }
        
        // Draw row headers
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '12px Arial';
        
        const startRow = Math.floor(this.scrollY / defaultRowHeight);
        const endRow = Math.min(startRow + Math.ceil(this.canvas.height / defaultRowHeight) + 1,        this.grid.rowCount);
        
        for (let row = startRow; row < endRow; row++) {
            const y = headerHeight + (row - startRow) * defaultRowHeight - (this.scrollY % defaultRowHeight);
            
            this.ctx.fillStyle = '#f0f0f0';
            this.ctx.fillRect(0, y, headerWidth, defaultRowHeight);
            this.ctx.strokeStyle = '#d4d4d4';
            this.ctx.strokeRect(0, y, headerWidth, defaultRowHeight);
            
            this.ctx.fillStyle = '#000';
            this.ctx.fillText((row + 1).toString(), headerWidth / 2, y + defaultRowHeight / 2);
        }
    }
    
    renderCells() {
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        
        const startCol = Math.floor(this.scrollX / defaultColWidth);
        const endCol = Math.min(startCol + Math.ceil(this.canvas.width / defaultColWidth) + 1, this.grid.colCount);
        
        const startRow = Math.floor(this.scrollY / defaultRowHeight);
        const endRow = Math.min(startRow + Math.ceil(this.canvas.height / defaultRowHeight) + 1, this.grid.rowCount);
        
        this.ctx.font = '12px Arial';
        this.ctx.textBaseline = 'middle';
        
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const x = headerWidth + (col - startCol) * defaultColWidth - (this.scrollX % defaultColWidth);
                const y = headerHeight + (row - startRow) * defaultRowHeight - (this.scrollY % defaultRowHeight);
                
                // Draw cell background
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(x, y, defaultColWidth, defaultRowHeight);
                this.ctx.strokeStyle = '#e0e0e0';
                this.ctx.strokeRect(x, y, defaultColWidth, defaultRowHeight);
                
                // Get cell data
                const cell = this.grid.getCell(row, col);
                if (!cell || !cell.value) continue;
                
                // Apply cell formatting
                this.ctx.fillStyle = cell.color || '#000';
                this.ctx.font = `${cell.bold ? 'bold ' : ''}${cell.italic ? 'italic ' : ''}12px Arial`;
                this.ctx.textAlign = cell.align || 'left';
                
                // Calculate text position
                let textX = x + 2;
                if (cell.align === 'center') {
                    textX = x + defaultColWidth / 2;
                } else if (cell.align === 'right') {
                    textX = x + defaultColWidth - 2;
                }
                
                // Draw cell text
                this.ctx.fillText(cell.value.toString(), textX, y + defaultRowHeight / 2);
            }
        }
    }
    
    renderSelection() {
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        
        if (selection instanceof CellReference) {
            this.renderSingleSelection(selection.row, selection.col);
        } else if (selection instanceof CellRange) {
            this.renderRangeSelection(selection);
        }
        
        // Highlight active cell (for range selections)
        if (selection instanceof CellRange) {
            this.renderSingleSelection(selection.startRow, selection.startCol);
        }
    }
    
    renderSingleSelection(row, col) {
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        
        const startCol = Math.floor(this.scrollX / defaultColWidth);
        const startRow = Math.floor(this.scrollY / defaultRowHeight);
        
        const x = headerWidth + (col - startCol) * defaultColWidth - (this.scrollX % defaultColWidth);
        const y = headerHeight + (row - startRow) * defaultRowHeight - (this.scrollY % defaultRowHeight);
        
        // Draw selection border
        this.ctx.strokeStyle = '#1a73e8';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, defaultColWidth, defaultRowHeight);
        this.ctx.lineWidth = 1;
    }
    
    renderRangeSelection(range) {
        const { headerHeight, headerWidth, defaultRowHeight, defaultColWidth } = this.options;
        
        const startCol = Math.floor(this.scrollX / defaultColWidth);
        const startRow = Math.floor(this.scrollY / defaultRowHeight);
        
        const minX = headerWidth + (range.startCol - startCol) * defaultColWidth - (this.scrollX % defaultColWidth);
        const minY = headerHeight + (range.startRow - startRow) * defaultRowHeight - (this.scrollY % defaultRowHeight);
        
        const maxX = headerWidth + (range.endCol - startCol + 1) * defaultColWidth - (this.scrollX % defaultColWidth);
        const maxY = headerHeight + (range.endRow - startRow + 1) * defaultRowHeight - (this.scrollY % defaultRowHeight);
        
        const width = maxX - minX;
        const height = maxY - minY;
        
        // Draw selection background
        this.ctx.fillStyle = 'rgba(26, 115, 232, 0.1)';
        this.ctx.fillRect(minX, minY, width, height);
        
        // Draw selection border
        this.ctx.strokeStyle = '#1a73e8';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(minX, minY, width, height);
    }
    
    // Command methods
    undo() {
        this.commandManager.undo();
        this.render();
    }
    
    redo() {
        this.commandManager.redo();
        this.render();
    }
    
    // Clipboard operations
    cut() {
        this.copy();
        this.clearSelectedCells();
    }
    
    copy() {
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        let data = [];
        
        if (selection instanceof CellReference) {
            const cell = this.grid.getCell(selection.row, selection.col);
            data = [[cell ? cell.value : '']];
        } else if (selection instanceof CellRange) {
            for (let row = selection.startRow; row <= selection.endRow; row++) {
                const rowData = [];
                for (let col = selection.startCol; col <= selection.endCol; col++) {
                    const cell = this.grid.getCell(row, col);
                    rowData.push(cell ? cell.value : '');
                }
                data.push(rowData);
            }
        }
        
        // Format as TSV for clipboard
        const tsv = data.map(row => row.join('\t')).join('\n');
        navigator.clipboard.writeText(tsv);
    }
    
    paste() {
        navigator.clipboard.readText().then(text => {
            const rows = text.split('\n');
            const data = rows.map(row => row.split('\t'));
            
            const selection = this.selectionManager.getSelection();
            if (!selection) return;
            
            let startRow, startCol;
            
            if (selection instanceof CellReference) {
                startRow = selection.row;
                startCol = selection.col;
            } else if (selection instanceof CellRange) {
                startRow = selection.startRow;
                startCol = selection.startCol;
            }
            
            const commands = [];
            
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].length; j++) {
                    const row = startRow + i;
                    const col = startCol + j;
                    
                    if (row >= this.grid.rowCount || col >= this.grid.colCount) continue;
                    
                    commands.push(new SetCellValueCommand(
                        this.grid,
                        row,
                        col,
                        data[i][j]
                    ));
                }
            }
            
            if (commands.length > 0) {
                const compoundCommand = new CompoundCommand(commands);
                this.commandManager.execute(compoundCommand);
                this.render();
            }
        });
    }
    
    // Formatting methods
    toggleBold() {
        this.applyFormattingToSelection('bold', cell => !cell.bold);
    }
    
    toggleItalic() {
        this.applyFormattingToSelection('italic', cell => !cell.italic);
    }
    
    toggleUnderline() {
        this.applyFormattingToSelection('underline', cell => !cell.underline);
    }
    
    setAlignment(align) {
        this.applyFormattingToSelection('align', () => align);
    }
    
    setNumberFormat(format) {
        this.applyFormattingToSelection('numberFormat', () => format);
    }
    
    applyFormattingToSelection(property, valueGetter) {
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        let cells = [];
        
        if (selection instanceof CellReference) {
            cells.push({ row: selection.row, col: selection.col });
        } else if (selection instanceof CellRange) {
            for (let row = selection.startRow; row <= selection.endRow; row++) {
                for (let col = selection.startCol; col <= selection.endCol; col++) {
                    cells.push({ row, col });
                }
            }
        }
        
        const commands = cells.map(({ row, col }) => {
            const cell = this.grid.getCell(row, col) || {};
            const newValue = valueGetter(cell);
            
            return new SetCellFormatCommand(
                this.grid,
                row,
                col,
                property,
                newValue
            );
        });
        
        if (commands.length > 0) {
            const compoundCommand = new CompoundCommand(commands);
            this.commandManager.execute(compoundCommand);
            this.render();
        }
    }
    
    // Data operations
    clearSelectedCells() {
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        let cells = [];
        
        if (selection instanceof CellReference) {
            cells.push({ row: selection.row, col: selection.col });
        } else if (selection instanceof CellRange) {
            for (let row = selection.startRow; row <= selection.endRow; row++) {
                for (let col = selection.startCol; col <= selection.endCol; col++) {
                    cells.push({ row, col });
                }
            }
        }
        
        const commands = cells.map(({ row, col }) => {
            return new SetCellValueCommand(
                this.grid,
                row,
                col,
                ''
            );
        });
        
        if (commands.length > 0) {
            const compoundCommand = new CompoundCommand(commands);
            this.commandManager.execute(compoundCommand);
            this.render();
        }
    }
    
    calculateSelected(operation) {
        const selection = this.selectionManager.getSelection();
        if (!selection) return;
        
        let cells = [];
        
        if (selection instanceof CellReference) {
            cells.push(this.grid.getCell(selection.row, selection.col));
        } else if (selection instanceof CellRange) {
            for (let row = selection.startRow; row <= selection.endRow; row++) {
                for (let col = selection.startCol; col <= selection.endCol; col++) {
                    cells.push(this.grid.getCell(row, col));
                }
            }
        }
        
        // Filter out empty cells and convert values to numbers
        const values = cells
            .filter(cell => cell && cell.value && !isNaN(cell.value))
            .map(cell => parseFloat(cell.value));
        
        if (values.length === 0) return;
        
        let result;
        switch (operation) {
            case 'sum':
                result = values.reduce((a, b) => a + b, 0);
                break;
            case 'avg':
                result = values.reduce((a, b) => a + b, 0) / values.length;
                break;
            case 'min':
                result = Math.min(...values);
                break;
            case 'max':
                result = Math.max(...values);
                break;
            case 'count':
                result = values.length;
                break;
        }
        
        // Format result based on operation
        let formattedResult;
        switch (operation) {
            case 'avg':
                formattedResult = result.toFixed(2);
                break;
            default:
                formattedResult = result.toString();
        }
        
        // Update formula bar
        this.textInput.value = `=${operation.toUpperCase()}(${this.getSelectionReference()})`;
        
        // Show result in status bar
        document.getElementById('status-bar').textContent = `${operation}: ${formattedResult}`;
    }
    
    getSelectionReference() {
        const selection = this.selectionManager.getSelection();
        if (!selection) return '';
        
        if (selection instanceof CellReference) {
            return this.getCellAddress(selection.row, selection.col);
        } else if (selection instanceof CellRange) {
            return `${this.getCellAddress(selection.startRow, selection.startCol)}:${this.getCellAddress(selection.endRow, selection.endCol)}`;
        }
    }
    
    loadSampleData() {
        // Sample data for demonstration
        const sampleData = [
            ['Product', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'],
            ['Widget A', 120, 150, 180, 210, '=SUM(B2:E2)'],
            ['Widget B', 90, 110, 130, 150, '=SUM(B3:E3)'],
            ['Widget C', 200, 220, 240, 260, '=SUM(B4:E4)'],
            ['Total', '=SUM(B2:B4)', '=SUM(C2:C4)', '=SUM(D2:D4)', '=SUM(E2:E4)', '=SUM(F2:F4)']
        ];
        
        const commands = [];
        
        for (let i = 0; i < sampleData.length; i++) {
            for (let j = 0; j < sampleData[i].length; j++) {
                commands.push(new SetCellValueCommand(
                    this.grid,
                    i,
                    j,
                    sampleData[i][j]
                ));
            }
        }
        
        if (commands.length > 0) {
            const compoundCommand = new CompoundCommand(commands);
            this.commandManager.execute(compoundCommand);
            this.render();
        }
    }
}


// Supporting classes
class Grid {
    constructor(rowCount, colCount) {
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.data = {};
    }
    
    getCell(row, col) {
        const key = `${row},${col}`;
        return this.data[key] || null;
    }
    
    setCell(row, col, value) {
        const key = `${row},${col}`;
        if (value === null || value === undefined || value === '') {
            delete this.data[key];
        } else {
            this.data[key] = this.data[key] || {};
            this.data[key].value = value;
        }
    }
    
    setCellFormat(row, col, property, value) {
        const key = `${row},${col}`;
        this.data[key] = this.data[key] || {};
        this.data[key][property] = value;
    }
}

class SelectionManager {
    constructor() {
        this.selection = null;
    }
    
    setSelection(selection) {
        this.selection = selection;
    }
    
    getSelection() {
        return this.selection;
    }
    
    hasSelection() {
        return this.selection !== null;
    }
}

class CellReference {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}

class CellRange {
    constructor(startRow, startCol, endRow, endCol) {
        this.startRow = startRow;
        this.startCol = startCol;
        this.endRow = endRow;
        this.endCol = endCol;
    }
    
    contains(row, col) {
        return row >= this.startRow && 
               row <= this.endRow && 
               col >= this.startCol && 
               col <= this.endCol;
    }
}

class CommandManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 100;
    }
    
    execute(command) {
        command.execute();
        this.undoStack.push(command);
        
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        
        this.redoStack = [];
    }
    
    undo() {
        if (this.undoStack.length === 0) return;
        
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
    }
    
    redo() {
        if (this.redoStack.length === 0) return;
        
        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
    }
}

class SetCellValueCommand {
    constructor(grid, row, col, value) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newValue = value;
        this.oldValue = grid.getCell(row, col) ? grid.getCell(row, col).value : '';
    }
    
    execute() {
        this.grid.setCell(this.row, this.col, this.newValue);
    }
    
    undo() {
        this.grid.setCell(this.row, this.col, this.oldValue);
    }
}

class SetCellFormatCommand {
    constructor(grid, row, col, property, value) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.property = property;
        this.newValue = value;
        
        const cell = grid.getCell(row, col) || {};
        this.oldValue = cell[property];
    }
    
    execute() {
        this.grid.setCellFormat(this.row, this.col, this.property, this.newValue);
    }
    
    undo() {
        this.grid.setCellFormat(this.row, this.col, this.property, this.oldValue);
    }
}

class CompoundCommand {
    constructor(commands) {
        this.commands = commands;
    }
    
    execute() {
        this.commands.forEach(cmd => cmd.execute());
    }
    
    undo() {
        this.commands.forEach(cmd => cmd.undo());
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const excel = new ExcelClone('excel-canvas', {
        rowCount: 1000,       // Number of rows
        colCount: 26,         // Number of columns (A-Z)
        defaultRowHeight: 20,  // Default row height in pixels
        defaultColWidth: 80    // Default column width in pixels
    });
    
    // Optional: Make it available in console for debugging
    window.excel = excel;
});