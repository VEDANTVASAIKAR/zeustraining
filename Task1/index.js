const form = document.getElementById('form')
form.addEventListener('submit',(e)=>{
    e.preventDefault()
    
    validate()
})

function validate(){
    const name = document.getElementById('name')
    const comments = document.getElementById('comments')
    const radio = document.getElementsByName('gender')
    let selected,g ;
    if (!name.value || !comments ){
        alert('cannot be empty')
    }

    for (let i = 0;i< radio.length;i++){
    
        if(radio[i].checked){
            g=radio[i]
            console.log(radio[i])
            selected = radio[i].value;
            break;
        }
    }
    if(!selected){
        alert('select gender')
    }
    name.value=''
    comments.value=''
    g.checked= false

}

// let welcome = document.getElementById('welcome')
// console.log(welcome)
// welcome.addEventListener('click',((e)=>{
//     e.preventDefault()
//     welcome.innerText='edbhcojebhojcbho'
//     console.log(e)
// }))

// new element creation
// let newe = document.createElement('p')
// newe.innerHTML='<button>click me</button>'
// document.body.appendChild(newe)

// // remove element
// let eler = document.getElementById('welcome')
// // eler.remove()
// // eler.parentNode.removeChild(eler);

// let how = document.getElementById('welcome')
// let innerh = how.innerHTML
// how.addEventListener('mouseover',(function hower (e){
//     this.innerHTML ='<p>choihcoich</p>'
// }))
// how.addEventListener('mouseout',(function ower(e) {
//     this.innerHTML =innerh
// }))

// document.addEventListener('keyup',(e)=>{
    
// })