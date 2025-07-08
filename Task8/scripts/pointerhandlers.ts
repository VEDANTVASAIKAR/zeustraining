import { selectionManager } from "./selectionmanager";
import { EventManager } from "./eventmanager";


export class PointerHandlers {
    constructor(
        private container: HTMLElement,
        private eventmanager: EventManager, // Replace with actual type if available
        private selectionmanager: selectionManager // Replace with actual type if available
    ) {
        this.attachPointerEvents();
        this.eventmanager = eventmanager;
        this.selectionmanager = selectionmanager;
    }


    private attachPointerEvents() {
        window.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
        window.addEventListener('pointermove', (event) => this.handlePointerMove(event));
        window.addEventListener('pointerup', (event) => this.handlePointerUp(event));
    }

    hittest(event : PointerEvent) {

        if(this.eventmanager.isOverResizeHandle(event.clientX, event.clientY)){
            return this.eventmanager
        }else if(this.selectionmanager.hitdown(event.clientX, event.clientY)){
            return this.selectionmanager;
        }
        
        
    }

    private handlePointerDown(event: PointerEvent) {
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

    private handlePointerMove(event: PointerEvent) {
        this.hittest(event);
        // Handle pointer move logic
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseMove(event);
        // }
    }

    private handlePointerUp(event: PointerEvent) {
        this.hittest(event);
        // Handle pointer up logic
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseUp(event);
        // }
        if(this.selectionmanager){
            this.selectionmanager.handlePointerUp(event);
        }
    }
    
}