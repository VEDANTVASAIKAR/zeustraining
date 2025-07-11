import { selectionManager } from "./selectionmanager";
import { EventManager } from "./eventmanager";
import { ResizeRows } from "./resizerows";
import { ResizeCols } from "./resizecols";
import { RowSelectionManager } from "./rowselection";   
import { ColumnSelectionManager } from "./colselection";
import { CellSelectionManager } from "./cellselection";    

// Type for handlers that support hittest/pointer events
type PointerHandler =  ResizeRows | ResizeCols | RowSelectionManager | ColumnSelectionManager | CellSelectionManager;

export class PointerHandlers {
    eventarray: PointerHandler[] = [];
    eventfunction: EventManager | PointerHandler | null = null;

    constructor(
        private container: HTMLElement,
        private eventmanager: EventManager, 
        private resizerows: ResizeRows,
        private resizecols: ResizeCols,
        private rowselection: RowSelectionManager,
        private colselection: ColumnSelectionManager,  
        private cellselection: CellSelectionManager    
    ) {
        // Order matters if you want priority on hit test
        this.eventarray = [this.resizerows, this.resizecols, this.rowselection, this.colselection, this.cellselection];
        this.attachPointerEvents();
    }

    // Always show resize handles on any pointermove
    private handlePointerMove = (event: PointerEvent) => {

        this.eventmanager.showresizehandles(event);

        // If a handler is active (drag or resize), delegate pointermove to it
        if (this.eventfunction) {
            if ("handlePointerMove" in this.eventfunction) {
                this.eventfunction.handlePointerMove(event);
            }
        }
    };

    private handlePointerDown = (event: PointerEvent) => {
        this.eventfunction = this.hittest(event);

        if (this.eventfunction && "handlePointerDown" in this.eventfunction) {
            this.eventfunction.handlePointerDown(event);
        }
    };

    private handlePointerUp = (event: PointerEvent) => {
        if (this.eventfunction && "handlePointerUp" in this.eventfunction) {
            this.eventfunction.handlePointerUp(event);
        }
        this.eventfunction = null;
    };

    private attachPointerEvents() {
        // Attach pointermove permanently so resize handles always update
        this.container.addEventListener('pointerdown', this.handlePointerDown);
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
    }

    hittest(event: PointerEvent): PointerHandler | null {
        for (let handler of this.eventarray) {
            if (handler.hittest(event)) {
                return handler;
            }
        }
        return null;
    }
}