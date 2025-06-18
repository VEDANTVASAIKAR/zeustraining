// let maindiv = document.createElement('div');
// maindiv.classList.add('main-div')
// document.body.appendChild(maindiv)

// let pdiv= document.querySelector<HTMLElement>('.main-div')!
// let movable = document.createElement('div');
// movable.classList.add('movable')
// pdiv.appendChild(movable)

// let mdiv = document.querySelector<HTMLElement>('.movable')!

// function onPointerMove(e) {
//     const containerRect = maindiv.getBoundingClientRect();

//     const maxX = containerRect.right - mdiv.offsetWidth;
//     const maxY = containerRect.bottom - mdiv.offsetHeight;

//     const newX = Math.max(containerRect.left, Math.min(e.clientX, maxX));
//     const newY = Math.max(containerRect.top, Math.min(e.clientY, maxY));

//     mdiv.style.left = `${newX}px`;
//     mdiv.style.top = `${newY}px`;
// }

// function onPointerdown(e){
//     mdiv.setPointerCapture(e.pointerId);
//     mdiv.addEventListener('pointermove', onPointerMove);
// }

// function onPointerup(e){
//     mdiv.releasePointerCapture(e.pointerId);
//     mdiv.removeEventListener('pointermove', onPointerMove);
// }

// mdiv.addEventListener('pointerdown',onPointerdown);

// mdiv.addEventListener('pointerup', onPointerup)

class Div {
    element : HTMLElement;
    constructor(width : string,height : string){
        this.element = document.createElement('div');
        this.element.style.width = width;
        this.element.style.height = height;
    }

    classname(classname:string){
        this.element.classList.add(classname);
    }

    position(position:string){
        this.element.style.position = position
    }

    color(color:string){
        this.element.style.backgroundColor= color
    }

    append(parent:HTMLElement){
        parent.appendChild(this.element)
    }
}

class Movable extends Div {
    parent : HTMLElement;
    currentX: number = 0;
    currentY: number = 0;

    constructor(width : string, height : string) {
        super(width, height);
        this.onPointerdown = this.onPointerdown.bind(this);
        this.onPointerup = this.onPointerup.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onResize = this.onResize.bind(this);
        this.parent = this.element.parentElement!
    }

    onPointerMove(e : PointerEvent) {
        const parent = this.element.parentElement!;
        const containerRect = parent.getBoundingClientRect();

        const maxX = containerRect.right - this.element.offsetWidth;
        const maxY = containerRect.bottom - this.element.offsetHeight;

        const newX = Math.max(containerRect.left, Math.min(e.clientX, maxX));
        const newY = Math.max(containerRect.top, Math.min(e.clientY, maxY));

        // Save current position relative to container
        this.currentX = newX - containerRect.left;
        this.currentY = newY - containerRect.top;

        this.element.style.left = `${this.currentX}px`;
        this.element.style.top = `${this.currentY}px`;
    }

    onResize() {
        const parent = this.element.parentElement!;
        const containerRect = parent.getBoundingClientRect();

        const maxX = containerRect.width - this.element.offsetWidth;
        const maxY = containerRect.height - this.element.offsetHeight;

        const clampedX = Math.max(0, Math.min(this.currentX, maxX));
        const clampedY = Math.max(0, Math.min(this.currentY, maxY));

        this.currentX = clampedX;
        this.currentY = clampedY;

        this.element.style.left = `${this.currentX}px`;
        this.element.style.top = `${this.currentY}px`;
    }

    onPointerdown(e: PointerEvent){
        this.element.setPointerCapture(e.pointerId);
        this.element.addEventListener('pointermove', this.onPointerMove);
    }

    onPointerup(e : PointerEvent){
        this.element.releasePointerCapture(e.pointerId);
        this.element.removeEventListener('pointermove', this.onPointerMove);
    }

    execute(){
        this.element.addEventListener('pointerdown', this.onPointerdown);
        this.element.addEventListener('pointerup', this.onPointerup);
        window.addEventListener('resize', this.onResize);
    }
}


class MainDiv extends Div {
    constructor(width : string,height : string){
        super(width,height)
    }
}


let maindiv = new MainDiv('','')
// maindiv.position('fixed');
maindiv.classname('main-div')
maindiv.append(document.body)

// let maindiv1 = new MainDiv('','')
// // maindiv1.position('fixed');
// maindiv1.color('black')
// maindiv1.classname('main-div')
// maindiv1.append(document.body)

let movable = new Movable('50px','50px')
movable.position('absolute')
movable.classname('movable')
movable.color('burlywood')
movable.append(maindiv.element)
movable.execute()

// let movable1 = new Movable('50px','50px')
// movable1.position('absolute')
// movable1.classname('movable')
// movable1.color('yellow')
// movable1.append(maindiv1.element)
// movable1.execute()

