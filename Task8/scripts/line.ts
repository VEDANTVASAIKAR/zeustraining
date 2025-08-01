
export class Line{

    constructor(
        public x1:number,
        public y1:number,
        public x2:number,
        public y2:number
    ){}
    draw(ctx : CanvasRenderingContext2D){

        ctx.beginPath();
        ctx.moveTo(this.x1,this.y1);
        ctx.lineTo(this.x2,this.y2);
        ctx.lineWidth = 1;
        ctx.strokeStyle=  '#e0e0e0'
        ctx.stroke();
    }
    
}