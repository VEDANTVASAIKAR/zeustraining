let canvas = document.querySelector('canvas')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight

var c = canvas.getContext('2d');
// c.fillStyle ="#cf4027"
// c.fillRect(300,100,100,100);

// c.fillStyle ="blue"
// c.fillRect(450,100,100,100);

// //line//
// c.strokeStyle = '#cf4027'
// c.beginPath();
// c.moveTo(100,750)
// c.lineTo(200,100)
// c.stroke();

// c.strokeStyle = '#cf4027'
// c.beginPath();
// c.moveTo(20,650)
// c.lineTo(200,100)
// c.stroke();
// c.strokeStyle = '#cf4027'

//circle//
// c.beginPath();
// c.arc(300, 300, 30, 0, Math.PI*2, false)
// c.strokeStyle = 'green'
// c.stroke();

// for (let i=0;i<5;i++){
//     var x= Math.random() * window.innerWidth;
//     var y = Math.random() * window.innerHeight;
//     c.beginPath();
//     c.arc(x, y, 30, 0, Math.PI*2, false)
//     c.strokeStyle = 'green'
//     c.stroke();

// }
// for (let i=0;i<5;i++){
//     var sx= Math.random() * window.innerWidth;
//     var sy = Math.random() * window.innerHeight;
//     var ex= Math.random() * window.innerWidth;
//     var ey = Math.random() * window.innerHeight;
//     c.strokeStyle = '#cf4027'
//     c.beginPath();
//     c.moveTo(sx,sy)
//     c.lineTo(ey,ex)
//     c.stroke();
//     }
// function animate(){

//     requestAnimationFrame(animate);
//     c.clearRect(0,0,innerWidth,innerHeight);

//     // circle.update()

//     // c.beginPath();
//     // c.arc(x, y, radius, 0, Math.PI*2, false);
//     // c.strokeStyle = 'green'
//     // c.stroke();
//     // console.log('udindindindunmadindindindun')
//     // if (x+radius > innerWidth || x-radius < 0){
//     //     dx = -dx;
//     // }
//     // if (y+radius > innerHeight || y-radius < 0){
//     //     dy = -dy;
//     // }
//     // x +=dx;
//     // y +=dy;
// }

var mouse = {
    x : undefined,
    y : undefined
}

window.addEventListener('mousemove',function(e){
    mouse.x = e.x;
    mouse.y = e.y;
    
})

function Circle(x,y,dx,dy,radius){
    this.x = x;
    this.y =y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius

    this.draw= function(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.strokeStyle = 'light-blue'
        c.stroke();
        c.fill()
    }
    this.update = function(){
        if (this.x+this.radius > innerWidth || this.x-this.radius < 0){
            this.dx = - this.dx;
        }
        if (this.y+this.radius > innerHeight || this.y-this.radius < 0){
            this.dy = - this.dy;
        }
        this.x +=this.dx;
        this.y += this.dy;

//interactivity
        if (mouse.x - this.x < 50 && mouse.x -this.x > -50
            && mouse.y - this.y < 50 && mouse.y - this.y < -50
        ){
            if(this.radius <40){
                this.radius +=1
            }
            
        }else if (this.radius > 4){
            this.radius -=1
        }

        this.draw()
    }
}

// var x = Math.random() * innerWidth;
// var y = Math.random() * innerHeight;
// var dx =(Math.random() - 0.5) * 10;
// var dy =(Math.random() - 0.5) * 10;
// var radius = 30;

// var circle = new Circle(x,y,dx,dy,radius);
var circlearr = [];

for (let i =0;i<100;i++){
    var radius = 30;
    var x = Math.random() * (innerWidth-(radius*2)) + (radius);
    var y = Math.random() * (innerHeight - (radius*2)) + (radius);
    var dx =(Math.random() - 0.5) * 4;
    var dy =(Math.random() - 0.5) * 4;

    circlearr.push(new Circle(x,y,dx,dy,radius));
}


function animate(){

    requestAnimationFrame(animate);
    c.clearRect(0,0,innerWidth,innerHeight);

    for (let i=0;i< circlearr.length;i++){
        circlearr[i].update();
    }
}

animate()