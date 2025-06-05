let submit = document.getElementById('button')
submit.addEventListener('click',(e)=>{
    e.preventDefault()
    let num = document.getElementById('number').value
    function mult(val,n){

        let carry = 0;
        let result=[];

        for (let i=val.length-1;i >=0;i--){
            let prod= val[i]*n +carry;
            carry = Math.floor(prod/1000);
            result.unshift(prod%1000)
        }
        while (carry>0){
            result.unshift(carry%1000);
            carry = Math.floor(carry/1000)
        }
        return result

    }


    function fact(num){
        let arr=[1];

        // to do multiplication how many times ?
        for (let n=1;n<=num;n++){
            arr = mult(arr,n)
        }

        return arr.join('')
    }

    let answer = fact(num)
    console.log(answer)

    let para= document.getElementById('answer')
    para.innerText= answer

    })




