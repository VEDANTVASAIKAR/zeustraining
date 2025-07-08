export class PointerHandlers {
    constructor(container, eventmanager, // Replace with actual type if available
    selectionmanager // Replace with actual type if available
    ) {
        this.container = container;
        this.eventmanager = eventmanager;
        this.selectionmanager = selectionmanager;
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
    }
    handlePointerDown(event) {
        let eventfunction = this.hittest(event);
        eventfunction?.handlePointerDown(event);
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseDown(event);
        // }
        // if(this.selectionmanager){
        //     this.selectionmanager.handleMouseDown(event);
        // }
        // Handle pointer down logic
    }
    handlePointerMove(event) {
        this.hittest(event);
        // Handle pointer move logic
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseMove(event);
        // }
    }
    handlePointerUp(event) {
        this.hittest(event);
        // Handle pointer up logic
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseUp(event);
        // }
        if (this.selectionmanager) {
            this.selectionmanager.handlePointerUp(event);
        }
    }
}
