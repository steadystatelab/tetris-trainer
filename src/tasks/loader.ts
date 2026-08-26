import type { Matrix, Cell } from '../engine/types';
import { createEmptyMatrix } from '../engine/matrix';

export function parseASCIIBoard(boardStr: string): Matrix {
  const matrix = createEmptyMatrix();
  const rows = boardStr.trim().split('\n').map(r => r.trim());

  if (rows.length === 0 || (rows.length === 1 && rows[0] === '')) {
    return matrix;
  }

  // We bottom-align the provided rows to the bottom of the matrix (row 39)
  // For example, if there are 4 rows, they go into indices 36, 37, 38, 39.
  const startY = 40 - rows.length;

  for (let i = 0; i < rows.length; i++) {
    const rowStr = rows[i];
    const y = startY + i;

    for (let x = 0; x < 10; x++) {
      if (x < rowStr.length) {
        const char = rowStr[x].toUpperCase();
        let cell: Cell = null;

        if (char === 'I' || char === 'J' || char === 'L' || char === 'O' ||
            char === 'S' || char === 'T' || char === 'Z') {
          cell = char as Cell;
        } else if (char === 'G' || char === 'X') {
          cell = 'GARBAGE';
        }

        matrix[y][x] = cell;
      }
    }
  }

  return matrix;
}
