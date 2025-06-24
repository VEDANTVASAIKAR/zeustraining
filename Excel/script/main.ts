import {Grid} from './core/grid.js'


document.addEventListener('DOMContentLoaded', () => {
    const baseCanvas = document.getElementById('baseCanvas') as HTMLCanvasElement;
    const container = document.getElementById('canvasContainer')!;
    const grid = new Grid(baseCanvas, container);
    grid.init();
});
