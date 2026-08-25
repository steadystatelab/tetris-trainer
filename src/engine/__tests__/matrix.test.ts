import { describe, it, expect } from 'vitest';
import { createEmptyMatrix, clearLines, placePiece, getDropPosition } from '../matrix';
import { SHAPES } from '../srs';

describe('Matrix Operations', () => {
  it('creates an empty matrix of 40x10', () => {
    const matrix = createEmptyMatrix();
    expect(matrix.length).toBe(40);
    expect(matrix[0].length).toBe(10);
    expect(matrix[39][9]).toBe(null);
  });

  it('places a piece immutably', () => {
    const matrix = createEmptyMatrix();
    const tShape = SHAPES['T'];

    const newMatrix = placePiece(matrix, tShape, { x: 3, y: 19 });

    // Original should be unmodified
    expect(matrix[20][4]).toBe(null);

    // New matrix should have the piece (T center is at x+1, y+1 of bounding box)
    expect(newMatrix[20][4]).toBe('T');
    expect(newMatrix[20][3]).toBe('T');
    expect(newMatrix[20][5]).toBe('T');
    expect(newMatrix[19][4]).toBe('T');
  });

  it('clears lines and adds empty ones at the top', () => {
    let matrix = createEmptyMatrix();
    // Fill bottom two rows
    for (let x = 0; x < 10; x++) {
      matrix[38][x] = 'GARBAGE';
      matrix[39][x] = 'GARBAGE';
    }
    // Add a single block on row 37
    matrix[37][0] = 'I';

    const { newMatrix, linesCleared } = clearLines(matrix);

    expect(linesCleared).toBe(2);
    expect(newMatrix.length).toBe(40);
    expect(newMatrix[39][0]).toBe('I'); // The block from row 37 fell down 2 rows
    expect(newMatrix[38][0]).toBe(null);
  });

  it('calculates the drop (ghost) position correctly', () => {
    const matrix = createEmptyMatrix();
    const tShape = SHAPES['T'];

    // Put a block at the bottom
    matrix[39][4] = 'GARBAGE';

    const startPos = { x: 3, y: 0 };
    const dropPos = getDropPosition(matrix, tShape, startPos);

    // The bottom-most part of T in spawn orientation is row 1 of its bounding box.
    // If dropPos.y is 37: bounding box rows are 37, 38, 39.
    // T's blocks are at y=37 (center), y=38 (left, center, right).
    // So the T's center bottom block will be at matrix[38][4], directly above matrix[39][4].
    expect(dropPos).toEqual({ x: 3, y: 37 });
  });
});
