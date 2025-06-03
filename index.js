const form = document.getElementById('form')
form.addEventListener('submit',(e)=>{
    e.preventDefault()
    validate()
})

function validate(){
    const name = document.getElementById('name').value
    const comments = document.getElementById('comments').value
    const radio = document.getElementsByName('gender')
    let selected;
    if (name ==='' || comments ===''){
        alert('cannot be empty')
    }

    for (let i = 0;i< radio.length;i++){
        if(radio[i].checked){
            console.log(radio[i])
            selected = radio[i].value;
            break;
        }
    }
    if(!selected){
        alert('select gender')
    }
}

