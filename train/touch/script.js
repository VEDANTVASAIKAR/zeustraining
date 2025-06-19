const d = document.getElementById('top-half')
btn = document.getElementById('clear')
console.log(btn)
let rect = d.getBoundingClientRect()
d.addEventListener('touchstart',e=>{
    [...e.changedTouches].forEach(touch =>{
        const dot = document.createElement('div')
        dot.classList.add('dot')
        dot.style.top = `${touch.pageY}px`
        dot.style.left = `${touch.pageX}px`
        dot.id = touch.identifier
        d.append(dot)
    })
    
})
d.addEventListener('touchmove',e=>{
    [...e.changedTouches].forEach(touch =>{
        const dot = document.getElementById(touch.identifier)
        dot.style.top = `${touch.pageY}px`
        dot.style.left = `${touch.pageX}px`
        if (touch.pageX >= rect.left &&
            touch.pageX <= rect.right &&
            touch.pageY >= rect.top &&
            touch.pageY <= rect.bottom){
            const dots = document.createElement('div')
            dots.classList.add('dot')
            dots.style.top = `${touch.pageY}px`
            dots.style.left = `${touch.pageX}px`
            dots.id = touch.identifier
            d.append(dots)
        }
    })
    
})
btn.addEventListener('click',()=>{
    console.log('hi');
    const dot = document.querySelectorAll('.dot')
    console.log(typeof dot);
    for ( let d of dot){
     d.remove()
    }
})

// d.addEventListener('touchend',e=>{
//     [...e.changedTouches].forEach(touch =>{
//         const dot = document.querySelectorAll('.dot')
//        console.log(typeof dot);
//        for ( let d of dot){
//         d.remove()
//        }
       
//         // dot.remove()
//         // console.log(dot);
        
//     })
    
// })
// d.addEventListener('touchcancel',e=>{
//     [...e.changedTouches].forEach(touch =>{
//         const dot = document.getElementById(touch.identifier)
//         dot.remove()
//     })
    
// })