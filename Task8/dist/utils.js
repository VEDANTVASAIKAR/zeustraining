/**
 * Finds the index in a sizes array (widths or heights) for a coordinate.
 * @param {number} coord The x or y coordinate from the mouse click.
 * @param {number[]} sizes The array of widths (for columns) or heights (for rows).
 * @returns {number} The index of the column/row, or -1 if out of bounds.
 */
export function findIndexFromCoord(coord, sizes) {
    let sum = 0;
    for (let i = 0; i < sizes.length; i++) {
        sum += sizes[i];
        if (coord < sum) {
            return i;
        }
    }
    return -1;
}
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
console.log(getExcelColumnLabel(25000));
