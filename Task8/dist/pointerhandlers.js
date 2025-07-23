export class PointerHandlers {
    constructor(container, eventmanager, resizerows, resizecols, rowselection, colselection, cellselection, cornercell) {
        this.container = container;
        this.eventmanager = eventmanager;
        this.resizerows = resizerows;
        this.resizecols = resizecols;
        this.rowselection = rowselection;
        this.colselection = colselection;
        this.cellselection = cellselection;
        this.cornercell = cornercell;
        this.eventarray = [];
        this.eventfunction = null;
        // Always show resize handles on any pointermove
        this.handlePointerMove = (event) => {
            this.eventmanager.showresizehandles(event);
            // If a handler is active (drag or resize), delegate pointermove to it
            if (this.eventfunction) {
                if ("handlePointerMove" in this.eventfunction) {
                    this.eventfunction.handlePointerMove(event);
                }
            }
        };
        this.handlePointerDown = (event) => {
            if (event.clientX > this.container.clientWidth || event.clientY > this.container.clientHeight) {
                return;
            }
            this.eventfunction = this.hittest(event);
            if (this.eventfunction && "handlePointerDown" in this.eventfunction) {
                this.eventfunction.handlePointerDown(event);
            }
        };
        this.handlePointerUp = (event) => {
            if (this.eventfunction && "handlePointerUp" in this.eventfunction) {
                this.eventfunction.handlePointerUp(event);
            }
            this.eventfunction = null;
        };
        // Order matters if you want priority on hit test
        this.eventarray = [this.resizerows, this.resizecols, this.rowselection, this.colselection, this.cellselection, this.cornercell];
        this.attachPointerEvents();
    }
    attachPointerEvents() {
        // Attach pointermove permanently so resize handles always update
        this.container.addEventListener('pointerdown', this.handlePointerDown);
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerup', this.handlePointerUp);
    }
    hittest(event) {
        for (let handler of this.eventarray) {
            if (handler.hittest(event)) {
                return handler;
            }
        }
        return null;
    }
}
