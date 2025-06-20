const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");


    const rows = 50;
    const cols = 15;

    function resizeCanvas() {
      // Match canvas size to its CSS size and scale for devicePixelRatio
      const rect = canvas.getBoundingClientRect();
      const DPR = window.devicePixelRatio || 1;

      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;

      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any scaling
      ctx.scale(DPR, DPR); // scale drawing to match CSS pixels

      drawGrid(rect.width, rect.height);
    }

    function drawGrid(width, height) {
      const cellWidth = 60;
      const cellHeight = 20;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 0.3;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellWidth;
          const y = row * cellHeight;
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
      }
    }

    // Initial draw
    resizeCanvas();

    // Redraw on resize
    window.addEventListener("resize", resizeCanvas);

    canvas.addEventListener("click", handleCanvasClick);

    function handleCanvasClick(event) {
        console.log(event)
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);

        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            const key = `${row},${col}`;
            showInputBox(x, y, key);
        }
    }
