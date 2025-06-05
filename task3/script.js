let n = 9;
let arr=[n]
for (let i = n-1;i>0;i--){
    n *=i
    arr.push(n)
}
console.log(n)
console.log(arr)