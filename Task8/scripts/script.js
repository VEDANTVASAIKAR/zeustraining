function drawGrid(rows, cols) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    canvas.style.width = "".concat(window.innerWidth, "px");
    canvas.style.height = "".concat(window.innerHeight, "px");
    if (!ctx)
        return;
    var cellWidth = canvas.width / cols;
    var cellHeight = canvas.height / rows;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ccc';
    for (var c = 0; c <= cols; c++) {
        var x = c * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (var r = 0; r <= rows; r++) {
        var y = r * cellHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}
var rows = 10;
var cols = 5;
drawGrid(rows, cols);
