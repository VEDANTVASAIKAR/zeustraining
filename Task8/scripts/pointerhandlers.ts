import { selectionManager } from "./selectionmanager";
import { EventManager } from "./eventmanager";


export class PointerHandlers {

    eventfunction : EventManager | selectionManager | null = null;
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
        else{
            return null;
        }
        
        
    }

    private handlePointerDown(event: PointerEvent) {
        this.eventfunction = this.hittest(event);
        if(this.eventfunction){
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

    private handlePointerMove(event: PointerEvent) {
        // to show handles
        if (!this.eventfunction){
            this.eventfunction = this.hittest(event);
        }
        
        this.eventmanager.showresizehandles(event);
        this.eventmanager.handlePointerMove(event);


        // Handle pointer move logic
        // if (this.eventmanager){
        //     this.eventmanager.handleMouseMove(event);
        // }
    }

    private handlePointerUp(event: PointerEvent) {
        window.removeEventListener('pointermove', this.handlePointerMove);
        if (this.eventfunction){
            this.eventfunction?.handlePointerUp(event);            
        }
        // Handle pointer up logic
        this.eventfunction = null; // Reset the event function after handling
    }
    
}