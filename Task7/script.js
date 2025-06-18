// let maindiv = document.createElement('div');
// maindiv.classList.add('main-div')
// document.body.appendChild(maindiv)
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var Div = /** @class */ (function () {
    function Div(width, height) {
        this.element = document.createElement('div');
        this.element.style.width = width;
        this.element.style.height = height;
    }
    Div.prototype.classname = function (classname) {
        this.element.classList.add(classname);
    };
    Div.prototype.position = function (position) {
        this.element.style.position = position;
    };
    Div.prototype.color = function (color) {
        this.element.style.backgroundColor = color;
    };
    Div.prototype.append = function (parent) {
        parent.appendChild(this.element);
    };
    return Div;
}());
var Movable = /** @class */ (function (_super) {
    __extends(Movable, _super);
    function Movable(width, height) {
        var _this = _super.call(this, width, height) || this;
        _this.currentX = 0;
        _this.currentY = 0;
        _this.onPointerdown = _this.onPointerdown.bind(_this);
        _this.onPointerup = _this.onPointerup.bind(_this);
        _this.onPointerMove = _this.onPointerMove.bind(_this);
        _this.onResize = _this.onResize.bind(_this);
        _this.parent = _this.element.parentElement;
        return _this;
    }
    Movable.prototype.onPointerMove = function (e) {
        var parent = this.element.parentElement;
        var containerRect = parent.getBoundingClientRect();
        var maxX = containerRect.right - this.element.offsetWidth;
        var maxY = containerRect.bottom - this.element.offsetHeight;
        var newX = Math.max(containerRect.left, Math.min(e.clientX, maxX));
        var newY = Math.max(containerRect.top, Math.min(e.clientY, maxY));
        // Save current position relative to container
        this.currentX = newX - containerRect.left;
        this.currentY = newY - containerRect.top;
        this.element.style.left = "".concat(this.currentX, "px");
        this.element.style.top = "".concat(this.currentY, "px");
    };
    Movable.prototype.onResize = function () {
        var parent = this.element.parentElement;
        var containerRect = parent.getBoundingClientRect();
        var maxX = containerRect.width - this.element.offsetWidth;
        var maxY = containerRect.height - this.element.offsetHeight;
        var clampedX = Math.max(0, Math.min(this.currentX, maxX));
        var clampedY = Math.max(0, Math.min(this.currentY, maxY));
        this.currentX = clampedX;
        this.currentY = clampedY;
        this.element.style.left = "".concat(this.currentX, "px");
        this.element.style.top = "".concat(this.currentY, "px");
    };
    Movable.prototype.onPointerdown = function (e) {
        this.element.setPointerCapture(e.pointerId);
        this.element.addEventListener('pointermove', this.onPointerMove);
    };
    Movable.prototype.onPointerup = function (e) {
        this.element.releasePointerCapture(e.pointerId);
        this.element.removeEventListener('pointermove', this.onPointerMove);
    };
    Movable.prototype.execute = function () {
        this.element.addEventListener('pointerdown', this.onPointerdown);
        this.element.addEventListener('pointerup', this.onPointerup);
        window.addEventListener('resize', this.onResize);
    };
    return Movable;
}(Div));
var MainDiv = /** @class */ (function (_super) {
    __extends(MainDiv, _super);
    function MainDiv(width, height) {
        return _super.call(this, width, height) || this;
    }
    return MainDiv;
}(Div));
var maindiv = new MainDiv('100vw', '50vh');
// maindiv.position('fixed');
maindiv.classname('main-div');
maindiv.append(document.body);
var maindiv1 = new MainDiv('100vw', '50vh');
// maindiv1.position('fixed');
maindiv1.color('black');
maindiv1.classname('main-div');
maindiv1.append(document.body);
var movable = new Movable('50px', '50px');
movable.position('absolute');
movable.classname('movable');
movable.color('burlywood');
movable.append(maindiv.element);
movable.execute();
var movable1 = new Movable('50px', '50px');
movable1.position('absolute');
movable1.classname('movable');
movable1.color('yellow');
movable1.append(maindiv1.element);
movable1.execute();
// window.onresize = ()=>{
//     movable.onResize()
//     movable1.onResize()
// }
