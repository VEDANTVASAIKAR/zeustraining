const board = document.querySelector('.black')
btn = document.getElementById('clear')
const rect = board.getBoundingClientRect()
board.addEventListener('pointerdown',(e)=>{
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.id = e.pointerId;
    positiondot(e,dot);
    board.append(dot)
    console.log(e)

})
 
function positiondot(e,dot){
    // dot.style.width = `${e.width}px`;
    // dot.style.height = `${e.height}px`
    dot.style.top = `${e.clientY}px`
    dot.style.left = `${e.clientX}px`
}

board.addEventListener('pointermove',(e)=>{
    // const dot = document.getElementById(e.pointerId)
    // // if (dot==null) return
    // positiondot(e,dot)
    if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
    ){
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.id = e.pointerId;
        positiondot(e,dot);
        board.append(dot)
        console.log(e)
    }

})

// board.addEventListener('pointerup',(e)=>{
//     const dots = document.querySelectorAll('.dot')
//     // if (dot==null) return
//     for (let dot of dots) {
//         dot.remove()
//     }
// })
btn.addEventListener('click',(e)=>{
    const dots = document.querySelectorAll('.dot')
    // if (dot==null) return
    for (let dot of dots) {
        dot.remove()
    }
})