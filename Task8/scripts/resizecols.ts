import { Cols } from "./cols.js";
import { Rows } from "./rows.js";
import { GridDrawer } from "./griddrawer.js";
import { EventManager } from "./eventmanager.js";
import { selectionManager } from "./selectionmanager.js";
import { ScrollRefresh } from "./scrollrefresh.js";
import { drawVisibleColumnHeaders, Painter, SelectionRange } from "./paint.js";
import { CellManager } from "./cellmanager.js";
import { Commandpattern } from "./commandpattern.js";
import { celleditcommand } from "./celleditcommand.js";
import { resizeRowcommand } from "./resizerowcommand.js";
import { resizeColCommand } from "./resizecolcommand.js";

export class ResizeCols {
    /** Main canvas element */
    canvas: HTMLCanvasElement;
    /** Overlay canvas for temporary visual elements like resize guides */
    overlay: HTMLCanvasElement;
    /** Overlay canvas 2D rendering context */
    overlayCtx: CanvasRenderingContext2D;
    /** @type {number | null} The index of the column border currently hovered for resizing */
    hoveredColBorder: number | null = null;
    resizingCol: number | null = null; // Which column is being resized
    startX: number = 0;                // Where the drag started (for calculations)
    startWidth: number = 0;            // Initial width of the column
    private resizingColLeft: number | null = null;
    /** Position of the preview line when resizing */
    private previewLineX: number | null = null;
    container : HTMLElement;
    scrollRefresh: ScrollRefresh | null = null;
    selectionarr: SelectionRange[] = [];
    selection: SelectionRange | null = null;
    ctx: CanvasRenderingContext2D | null;
    cellmanager: CellManager;
    commapndpattern: Commandpattern | null = null;
    oldwidth: number =0

    constructor(
        /** Reference to the Cols object managing column widths */
        private cols: Cols,
        private rows: Rows,
        private griddrawer: GridDrawer,
        private eventManager: EventManager, 
        private selectionManager: selectionManager, 
        cellmanager: CellManager,
        scrollRefresh: ScrollRefresh | null = null,
        commandpattern: Commandpattern 
        
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
      this.ctx = this.canvas.getContext("2d");
      this.cellmanager = cellmanager;
      this.commapndpattern = commandpattern;

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
    * Draws a vertical preview line during column resizing
    * @param x - X-coordinate where to draw the line
    */
    drawPreviewLineOverlayCol(x: number) {
      // Clear the overlay canvas
      this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
      
      // Begin drawing the dashed line
      this.overlayCtx.beginPath();
      this.overlayCtx.setLineDash([5, 5]); // Dashed line pattern
      this.overlayCtx.moveTo(x, 0);
      this.overlayCtx.lineTo(x, this.overlay.height);
      this.overlayCtx.strokeStyle = '#107c41';
      this.overlayCtx.lineWidth = 2;
      this.overlayCtx.stroke();
      this.overlayCtx.setLineDash([]); // Reset dash pattern
    }

    handlePointerDown(event: PointerEvent) {
        console.log("Pointer down on column resize");
        
      if (this.hoveredColBorder !== null) {
            this.resizingCol = this.hoveredColBorder;
            this.startX = event.clientX; 
            this.startWidth = this.cols.widths[this.resizingCol];
            
            // Calculate initial preview line position
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.resizingColLeft = sum;
            this.previewLineX = sum + this.cols.widths[this.resizingCol];
        }
    }
    
    handlePointerMove(event: PointerEvent) {

        if (this.resizingCol !== null && this.resizingColLeft !== null) {
            const { startRow, endRow, startCol, endCol } = this.griddrawer.getVisibleRange(this.rows, this.cols);
            const dx = event.clientX - this.startX;
            const newWidth = Math.max(10, this.startWidth + dx);
            this.cols.setWidth(this.resizingCol, newWidth);
            this.griddrawer.columnheaders(this.rows, this.cols); // Redraw headers
          
            
            let sum = 0;
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            this.previewLineX = this.resizingColLeft + newWidth;

            // console.log(this.previewLineX);
            
            // Only draw preview line on overlay
            const adjustedPreviewLineX = this.previewLineX - this.container.scrollLeft;
            this.griddrawer.drawPreviewLineOverlay(adjustedPreviewLineX);

            drawVisibleColumnHeaders(startRow,endRow, this.rows, this.cols, this.container,this.ctx!,  this.selectionarr, this.selection!);

            // this.griddrawer.drawVisibleColumnHeaders(startCol,endCol,this.rows, this.cols);
        }

    }

    handlePointerUp(event: PointerEvent) {
        console.log(this.selection, this.selectionarr);
      // Only do this if a column is being resized and a preview line exists
        if (this.resizingCol !== null && this.previewLineX !== null && this.resizingColLeft !== null) {
            // Calculate the sum of all column widths before the one being resized
            let sum = 0;
            let oldwidth = this.cols.widths[this.resizingCol];
            for (let i = 0; i < this.resizingCol; i++) {
                sum += this.cols.widths[i];
            }
            // The new width is the preview line position minus the sum of previous widths
            const finalWidth = this.previewLineX - this.resizingColLeft;
            
            // Update the width in the cols object
            this.cols.setWidth(this.resizingCol, finalWidth);
           
            this.commapndpattern?.execute(
                new resizeColCommand(this.cols,this.resizingCol,finalWidth,this.startWidth,this.griddrawer)
            );
            
            // Disable the preview line
            this.griddrawer.ctx.clearRect(0, 0, this.griddrawer.canvas.width, this.griddrawer.canvas.height);
            //  Clear the overlay (removes preview line)
            this.griddrawer.clearOverlay();
            // Redraw everything
            this.griddrawer.rendervisible(this.rows,this.cols)
            // }
            
            
            
        }
        // Reset the resizingCol state
        this.resizingCol = null;
        this.resizingColLeft = null;

        window.removeEventListener('pointermove', this.handlePointerMove.bind(this));
        Painter.paintSelectedCells(
                        this.ctx!, this.griddrawer, this.rows, this.cols,
                        this.cellmanager, this.container, this.selection, this.selectionarr
                    );
    }

    /**
     HIT TEST
     */
    hittest(event : any){

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate virtual coordinates with scroll offset
        const virtualX = x + this.container.scrollLeft;
        const virtualY = y + this.container.scrollTop;

        const threshold = 5; // px distance to detect border for resizing
        const headerHeight = this.rows.heights[0];
        const headerWidth = this.cols.widths[0];
        


        // --- Check for column resizing (hovering near right edge of any column in header row) ---
        if (y < headerHeight) {
            let sum = 0;
            for (let col = 0; col < this.cols.n; col++) {
                sum += this.cols.widths[col];
                // Using virtualX to account for scroll position
                if (Math.abs(virtualX - sum) < threshold) {
                    // this.canvas.style.cursor = "ew-resize";
                    this.hoveredColBorder = col;
                    return true
                }
            }
        }
        

        return false
        

    }







}