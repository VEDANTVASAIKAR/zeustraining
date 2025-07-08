export class PointerHandlers {
    constructor(container, eventmanager, // Replace with actual type if available
    selectionmanager // Replace with actual type if available
    ) {
        this.container = container;
        this.eventmanager = eventmanager;
        this.selectionmanager = selectionmanager;
        this.eventfunction = null;
        this.attachPointerEvents();
        this.eventmanager = eventmanager;
        this.selectionmanager = selectionmanager;
    }
    attachPointerEvents() {
        window.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
        window.addEventListener('pointermove', (event) => this.handlePointerMove(event));
        window.addEventListener('pointerup', (event) => this.handlePointerUp(event));
    }
    hittest(event) {
        if (this.eventmanager.isOverResizeHandle(event.clientX, event.clientY)) {
            return this.eventmanager;
        }
        else if (this.selectionmanager.hitdown(event.clientX, event.clientY)) {
            return this.selectionmanager;
        }
        else {
            return null;
        }
    }
    handlePointerDown(event) {
        this.eventfunction = this.hittest(event);
        if (this.eventfunction) {
            this.eventfunction.handlePointerDown(event);
        }
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseDown(event);
        // }
        // if(this.selectionmanager){
        //     this.selectionmanager.handleMouseDown(event);
        // }
        // Handle pointer down logic
    }
    handlePointerMove(event) {
        // to show handles
        if (!this.eventfunction) {
            this.eventfunction = this.hittest(event);
        }
        this.eventmanager.showresizehandles(event);
        this.eventmanager.handlePointerMove(event);
        // Handle pointer move logic
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseMove(event);
        // }
    }
    handlePointerUp(event) {
        window.removeEventListener('pointermove', this.handlePointerMove);
        if (this.eventfunction) {
            this.eventfunction?.handlePointerUp(event);
        }
        // Handle pointer up logic
        this.eventfunction = null; // Reset the event function after handling
    }
}
