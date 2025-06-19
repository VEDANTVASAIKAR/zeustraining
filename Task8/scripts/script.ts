function drawGrid(rows: number, cols: number): void {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    if (!ctx) return;

    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ccc';

    for (let c = 0; c <= cols; c++) {
      const x = c * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let r = 0; r <= rows; r++) {
      const y = r * cellHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

let rows : number = 10;
let cols : number = 5;
drawGrid(rows, cols);