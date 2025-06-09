// let nav2 = document.getElementsByClassName('nav2')
// let selectednav2= document.getElementsByClassName('selectednav2')
// console.log(nav2)
// nav2[0].addEventListener('click',()=>{
//     nav2[0].setAttribute('class','selectednav2')
//     selectednav2[0].setAttribute('class','nav2')
    

// })
// selectednav2[0].addEventListener('click',()=>{
//     selectednav2[0].setAttribute('class','selectednav2')
//     nav2[0].setAttribute('class','nav2')
    

// })



let nav = document.getElementsByTagName('li')
console.log(nav)
for(let i=0;1<=nav.length;i++){
    nav[i].addEventListener('click',(e)=>{
    for(let j=0;j<nav.length;j++){
        nav[j].setAttribute('class','navitem')
    }

    nav[i].setAttribute('class','selected-navitem')
    })
}
// let nav2 = document.querySelectorAll('.navigation2 div');  // only get divs inside .navigation2
// console.log(nav2);

// for (let i = 0; i < nav2.length; i++) {
//     nav2[i].addEventListener('click', (e) => {
//         for (let j = 0; j < nav2.length; j++) {
//             nav2[j].setAttribute('class', 'nav2');
//         }
//         nav2[i].setAttribute('class', 'selectednav2');
//     });
// }


nav2.addEventListener('click',()=>{
    nav2.setAttribute('class','selectednav2')
})