import { describe, it, expect } from 'vitest';

import { parseASCIIBoard } from '../loader';

describe('ASCII Board Loader', () => {
  it('loads an empty string into an empty matrix', () => {
    const matrix = parseASCIIBoard('');
    expect(matrix.length).toBe(40);
    expect(matrix.every(row => row.every(cell => cell === null))).toBe(true);
  });

  it('bottom aligns a partial string', () => {
    // 4 rows of garbage and empty space
    const boardStr = `
      X__X______
      XX_X______
      X_XX______
      XXXXXXXXXX
    `;

    const matrix = parseASCIIBoard(boardStr);

    // Row 36 (index 0 of the string)
    expect(matrix[36][0]).toBe('GARBAGE');
    expect(matrix[36][1]).toBe(null);
    expect(matrix[36][2]).toBe(null);
    expect(matrix[36][3]).toBe('GARBAGE');

    // Row 39 (index 3 of the string)
    expect(matrix[39].every(cell => cell === 'GARBAGE')).toBe(true);

    // Row 35 should be empty
    expect(matrix[35].every(cell => cell === null)).toBe(true);
  });

  it('parses piece blocks correctly', () => {
    const boardStr = `I__O_JJ___`;
    const matrix = parseASCIIBoard(boardStr);

    expect(matrix[39][0]).toBe('I');
    expect(matrix[39][1]).toBe(null);
    expect(matrix[39][2]).toBe(null);
    expect(matrix[39][3]).toBe('O');
    expect(matrix[39][5]).toBe('J');
    expect(matrix[39][6]).toBe('J');
    expect(matrix[39][9]).toBe(null);
  });
});