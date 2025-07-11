import { Cols } from "./cols.js";
import { Rows } from "./rows.js";
import { GridDrawer } from "./griddrawer.js";
import { EventManager } from "./eventmanager.js";
import { selectionManager } from "./selectionmanager.js";
import { ScrollRefresh } from "./scrollrefresh.js";
import { Painter, SelectionRange } from "./paint.js";
import { CellManager } from "./cellmanager.js";

export class ResizeRows {
    /** Main canvas element */
    canvas: HTMLCanvasElement;
    /** Overlay canvas for temporary visual elements like resize guides */
    overlay: HTMLCanvasElement;
    /** Overlay canvas 2D rendering context */
    overlayCtx: CanvasRenderingContext2D;
    /** @type {number | null} The index of the row border currently hovered for resizing */
    hoveredRowBorder: number | null = null;
    resizingRow: number | null = null; // Which row is being resized
    startY: number = 0;                // Where the drag started (for calculations)
    startHeight: number = 0;            // Initial height of the row
    private resizingColLeft: number | null = null;
    /** Position of the preview line when resizing */
    private previewLineY: number | null = null;
    scrollRefresh: ScrollRefresh | null = null;
    container : HTMLElement;
    selectionarr: SelectionRange[] = [];
    selection: SelectionRange | null = null;
    ctx: CanvasRenderingContext2D | null;
    cellmanager: CellManager;

    constructor(
        /** Reference to the Cols object managing column widths */
        private cols: Cols,
        private rows: Rows,
        private griddrawer: GridDrawer,
        private eventManager: EventManager, 
        private selectionManager: selectionManager, 
        cellmanager: CellManager,
        scrollRefresh: ScrollRefresh | null = null
        
    ){

      // Get the main canvas element
      this.canvas = document.getElementById("canvas") as HTMLCanvasElement;

      // Get the overlay canvas for temporary visual elements
      this.overlay = document.getElementById('overlay') as HTMLCanvasElement;

      //Get 2D rendering context
      const overlayCtx = this.overlay.getContext("2d");

      // Ensure we have valid contexts
      if (!overlayCtx) throw new Error("No 2D context");

      this.overlayCtx = overlayCtx;

      this.cols = cols;

      this.container = document.querySelector('.container') as HTMLElement;

      this.eventManager = eventManager;

      this.selectionManager = selectionManager;

      this.scrollRefresh = scrollRefresh;

      this.scrollRefresh = scrollRefresh;
      this.ctx = this.canvas.getContext("2d");
      this.cellmanager = cellmanager;

      this.listenSelectionChange();


    }

    listenSelectionChange() {
            window.addEventListener('selection-changed', (e: any) => {
                if (e.detail) {
                    this.selection = e.detail.selection;
                    this.selectionarr = e.detail.selectionarr;
                    
                    
                    // Painter.paintSelectedCells(
                    //     this.ctx!, this.griddrawer, this.rows, this.cols,
                    //     this.cellmanager, this.container, this.selection, this.selectionarr
                    // );
                }
            });
    }

    /**
    * Draws a horizontal preview line during row resizing
    * @param y - Y-coordinate where to draw the line
    */
    drawPreviewLineOverlayRow(y: number) {
        // Clear the overlay canvas
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        
        // Begin drawing the dashed line
        this.overlayCtx.beginPath();
        this.overlayCtx.setLineDash([5, 5]); // Dashed line pattern
        this.overlayCtx.moveTo(0, y);
        this.overlayCtx.lineTo(this.overlay.width, y);
        this.overlayCtx.strokeStyle = '#107c41';
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.stroke();
        this.overlayCtx.setLineDash([]); // Reset dash pattern
    }

    handlePointerDown(event: PointerEvent) {
        console.log("Pointer down on row resize");
        
      if (this.hoveredRowBorder !== null) {
            this.resizingRow = this.hoveredRowBorder;
            this.startY = event.clientY;
            this.startHeight = this.rows.heights[this.resizingRow];
            
            // Calculate initial preview line position
            let sum = 0;
            for (let i = 0; i <= this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            this.previewLineY = sum;
        }
    }
    
    handlePointerMove(event: PointerEvent) {
        console.log("Pointer move on row resize");
        
        if (this.resizingRow !== null) {
            const dy = event.clientY - this.startY;
            const newHeight = Math.max(10, this.startHeight + dy);
            this.rows.setHeight(this.resizingRow, newHeight);
            this.griddrawer.rowheaders(this.rows, this.cols); // Redraw headers
            
            let sum = 0;
            for (let i = 0; i < this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            this.previewLineY = sum + newHeight;

            // console.log(this.resizingRow);
            
            // Draw preview line horizontally on overlay
            const adjustedPreviewLineY = this.previewLineY - this.container.scrollTop;
            this.griddrawer.drawPreviewLineOverlayRow(adjustedPreviewLineY);
        }

    }

    handlePointerUp(event: PointerEvent) {
        console.log("Pointer up on row resize");
        
      // Only do this if a row is being resized and a preview line exists
        if (this.resizingRow !== null && this.previewLineY !== null) {
            // Calculate the sum of all row heights before the one being resized
            let sum = 0;
            for (let i = 0; i < this.resizingRow; i++) {
                sum += this.rows.heights[i];
            }
            // The new height is the preview line position minus the sum of previous heights
            const finalHeight = this.previewLineY - sum;
            
            // Update the height in the rows object
            this.rows.setHeight(this.resizingRow, finalHeight);

            // Disable the preview line
            this.griddrawer.ctx.clearRect(0, 0, this.griddrawer.canvas.width, this.griddrawer.canvas.height);

            // Clear the overlay (removes preview line)
            this.griddrawer.clearOverlay();

            // Redraw everything
            this.griddrawer.rendervisible(this.rows, this.cols)

            // If a selection exists, repaint it
            if (this.selection){
                    this.selectionManager.paintSelectedCells(this.selection?.startRow,this.selection?.startCol,this.selection?.endRow,this.selection?.endCol);
                    // this.selectionManager.selectMultipleRows(this.selection?.startRow, this.selection?.endRow);
            }
            this.eventManager.updateInputBoxIfVisible();
        }
        // Reset the resizingRow state
        this.resizingRow = null;
        this.previewLineY = null;
      
        window.removeEventListener('pointermove', this.handlePointerMove.bind(this));
        Painter.paintSelectedCells(
                        this.ctx!, this.griddrawer, this.rows, this.cols,
                        this.cellmanager, this.container, this.selection, this.selectionarr
                    );
    }

    /**
     HIT TEST
     */
    hittest(event: any){

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate virtual coordinates with scroll offset
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;

        const threshold = 5; // px distance to detect border for resizing
        const headerHeight = this.rows.heights[0];
        const headerWidth = this.cols.widths[0];
        
        // --- Check for row resizing (hovering near bottom edge of any row in the header column) ---
        if ( x < headerWidth) {
            let sum = 0;
            for (let row = 0; row < this.rows.n; row++) {
                sum += this.rows.heights[row];
                // Using virtualY to account for scroll position
                if (Math.abs(virtualY - sum) < threshold) {
                    // this.canvas.style.cursor = "ns-resize";
                    this.hoveredRowBorder = row;
                    return true
                }
            }
        }

        return false
        

    }








}