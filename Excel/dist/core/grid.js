/**
 * Excel-like infinite grid manager using canvases.
 * Adds/removes canvases as you scroll, just like Excel.
 */
export class Grid {
    constructor(container, scrollArea) {
        // Keeps track of which tiles (segmentX, segmentY) are already rendered
        this.renderedSegments = new Set();
        this.container = container;
        this.scrollArea = scrollArea;
    }
    /**
     * Start the grid system: initially render visible canvases and set up scroll listener.
     */
    init() {
        this.renderVisibleCanvases();
        this.setupScrollListener();
    }
    /**
     * Listen for scroll events and update canvases as needed.
     */
    setupScrollListener() {
        this.container.addEventListener('scroll', () => {
            this.renderVisibleCanvases();
        });
        // Also rerender after resize (viewport may change)
        window.addEventListener('resize', () => {
            this.renderVisibleCanvases();
        });
    }
    /**
     * Render all canvases needed to cover the visible area.
     */
    renderVisibleCanvases() {
        const viewLeft = this.container.scrollLeft;
        const viewTop = this.container.scrollTop;
        const viewRight = viewLeft + this.container.clientWidth;
        const viewBottom = viewTop + this.container.clientHeight;
        // Figure out which tile indices are visible (including a 1-tile buffer)
        const startX = Math.floor(viewLeft / Grid.TILE_WIDTH) - 1;
        const endX = Math.floor(viewRight / Grid.TILE_WIDTH) + 1;
        const startY = Math.floor(viewTop / Grid.TILE_HEIGHT) - 1;
        const endY = Math.floor(viewBottom / Grid.TILE_HEIGHT) + 1;
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const key = `${x}:${y}`;
                if (!this.renderedSegments.has(key)) {
                    this.renderedSegments.add(key);
                    this.createTileCanvas(x, y);
                }
            }
        }
    }
    /**
     * Create and add one canvas tile at (tileX, tileY).
     */
    createTileCanvas(tileX, tileY) {
        const canvas = document.createElement('canvas');
        canvas.width = Grid.TILE_WIDTH;
        canvas.height = Grid.TILE_HEIGHT;
        canvas.className = 'excel-canvas';
        // Position absolutely in grid coordinates
        canvas.style.left = `${tileX * Grid.TILE_WIDTH}px`;
        canvas.style.top = `${tileY * Grid.TILE_HEIGHT}px`;
        // Example: draw a grid and label it
        const ctx = canvas.getContext('2d');
        // Background
        ctx.fillStyle = (tileX + tileY) % 2 === 0 ? '#fff' : '#f8f8ff';
        ctx.fillRect(0, 0, Grid.TILE_WIDTH, Grid.TILE_HEIGHT);
        // Draw cell grid (every 100px for demo)
        ctx.strokeStyle = '#e0e0e0';
        // Label
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`Canvas [${tileX}, ${tileY}]`, 16, 30);
        canvas.id = `canvas-${tileX}-${tileY}`;
        this.container.appendChild(canvas);
    }
}
// Size of each canvas tile (match Excel's "screenful")
Grid.TILE_WIDTH = 1920;
Grid.TILE_HEIGHT = 560;
