export class PointerHandlers {
    constructor(container, eventmanager, selectionmanager, resizerows, resizecols) {
        this.container = container;
        this.eventmanager = eventmanager;
        this.selectionmanager = selectionmanager;
        this.resizerows = resizerows;
        this.resizecols = resizecols;
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
        this.eventarray = [this.resizerows, this.resizecols, this.selectionmanager];
        this.attachPointerEvents();
    }
    attachPointerEvents() {
        // Attach pointermove permanently so resize handles always update
        window.addEventListener('pointerdown', this.handlePointerDown);
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
