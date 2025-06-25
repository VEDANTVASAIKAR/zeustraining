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
