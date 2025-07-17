/**
 * Finds the index in a sizes array (widths or heights) for a coordinate.
 * @param {number} coord The x or y coordinate from the mouse click.
 * @param {number[]} sizes The array of widths (for columns) or heights (for rows).
 * @returns {number} The index of the column/row, or -1 if out of bounds.
 */
export function findIndexFromCoord(coord, sizes) {
    let sum = 0;
    console.log(sizes.length);
    for (let i = 0; i < sizes.length; i++) {
        sum += sizes[i];
        if (coord < sum) {
            return i;
        }
    }
    return -1;
}
// export function findIndexFromCooord(coord: number, prefixSum: number[]): number {
//     let left = 0, right = prefixSum.length - 1;
//     while (left < right) {
//         const mid = Math.floor((left + right) / 2);
//         if (coord < prefixSum[mid + 1]) {
//             right = mid;
//         } else {
//             left = mid + 1;
//         }
//     }
//     // left is now the smallest index such that coord < prefixSum[left+1]
//     return left < prefixSum.length - 1 ? left : -1;
// }
// function computePrefixSum(sizes: number[]): number[] {
//     const prefixSum = [0];
//     for (let i = 0; i < sizes.length; i++) {
//         prefixSum.push(prefixSum[i] + sizes[i]);
//     }
//     return prefixSum;
// }
// // Wrapper
// export function findIndexFromCoord(coord: number, sizes: number[]): number {
//     const prefixSum = computePrefixSum(sizes);
//     return findIndexFromCooord(coord, prefixSum);
// }
// **
//  * Converts a zero-based column index to Excel-style column header (A, B, ..., Z, AA, AB, ...).
//  * @param {number} index - Zero-based column index (0 = A)
//  * @returns {string} - Excel column header string
//  */
export function getExcelColumnLabel(index) {
    let label = '';
    while (index >= 0) {
        label = String.fromCharCode((index % 26) + 65) + label; // 65 = "A"
        index = Math.floor(index / 26) - 1;
    }
    return label;
}
// console.log(getExcelColumnLabel(25000))
