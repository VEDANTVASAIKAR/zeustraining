import { Grid } from './core/grid.js';
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvasContainer');
    const scrollArea = document.getElementById('scrollArea');
    const grid = new Grid(container, scrollArea);
    grid.init();
});
