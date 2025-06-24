/**
 * This class manages the grid system and canvas rendering logic.
 * It handles the base canvas and dynamically adds canvases as the user scrolls.
 */
export class Grid {
    constructor(baseCanvas, container) {
        // A set to keep track of which canvas segments have already been created
        // This prevents creating the same canvas multiple times
        this.renderedSegments = new Set();
        this.baseCanvas = baseCanvas;
        this.baseCtx = baseCanvas.getContext('2d'); // Get the 2D drawing context
        this.container = container;
    }
    /**
     * This method starts everything — it renders the base canvas
     * and sets up the scroll listener to create canvases dynamically.
     */
    init() {
        this.renderBaseCanvas(); // Draw something on the base canvas
        this.setupScrollListener(); // Start listening for scroll events
    }
    /**
     * Draws the base canvas — this canvas is always visible.
     * Think of it like the top-left corner of Excel.
     */
    renderBaseCanvas() {
        this.baseCtx.fillStyle = '#f0f0f0'; // Light gray background
        this.baseCtx.fillRect(0, 0, this.baseCanvas.width, this.baseCanvas.height); // Fill the canvas
        this.baseCtx.fillStyle = '#333'; // Dark text color
        this.baseCtx.fillText('Base Canvas Always Visible', 10, 20); // Draw some text
    }
    /**
     * This sets up a scroll listener on the canvas container.
     * Every time the user scrolls, we check if we need to add a new canvas.
     *
     * FIX: Listen on the container, not window, and use scrollLeft/scrollTop.
     */
    setupScrollListener() {
        this.container.addEventListener('scroll', () => {
            const scrollX = this.container.scrollLeft;
            const scrollY = this.container.scrollTop;
            const segmentX = Math.floor(scrollX / this.baseCanvas.width);
            const segmentY = Math.floor(scrollY / this.baseCanvas.height);
            const segmentKey = `${segmentX}:${segmentY}`;
            if (!this.renderedSegments.has(segmentKey)) {
                this.renderedSegments.add(segmentKey);
                this.createDynamicCanvas(segmentX, segmentY);
            }
        });
    }
    /**
     * This creates a new canvas at the correct position based on scroll.
     * @param segmentX Horizontal segment index
     * @param segmentY Vertical segment index
     */
    createDynamicCanvas(segmentX, segmentY) {
        // Create a new canvas element
        const dynamicCanvas = document.createElement('canvas');
        dynamicCanvas.width = this.baseCanvas.width; // Same width as base canvas
        dynamicCanvas.height = this.baseCanvas.height; // Same height as base canvas
        // Position the canvas absolutely inside the container
        dynamicCanvas.style.position = 'absolute';
        dynamicCanvas.style.left = `${segmentX * this.baseCanvas.width}px`; // Horizontal position
        dynamicCanvas.style.top = `${segmentY * this.baseCanvas.height}px`; // Vertical position
        dynamicCanvas.style.zIndex = '1'; // Make sure it's above the base canvas
        // Get the drawing context for the new canvas
        const ctx = dynamicCanvas.getContext('2d');
        ctx.fillStyle = '#fff'; // White background
        ctx.fillRect(0, 0, dynamicCanvas.width, dynamicCanvas.height); // Fill the canvas
        ctx.fillStyle = '#000'; // Black text
        ctx.fillText(`Canvas [${segmentX}, ${segmentY}]`, 10, 20); // Label the canvas
        // Add the canvas to the container (not directly to the body!)
        this.container.appendChild(dynamicCanvas);
    }
}
