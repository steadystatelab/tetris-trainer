import { Matrix, Point, Cell } from './types';
import { checkCollision } from './srs';

/**
 * Creates a standard empty matrix of 40x10.
 */
export function createEmptyMatrix(): Matrix {
  return Array.from({ length: 40 }, () => Array(10).fill(null));
}

/**
 * Places a piece onto a copy of the matrix.
 * Returns the new matrix, keeping the original immutable.
 */
export function placePiece(matrix: Matrix, shape: Cell[][], pos: Point): Matrix {
  const newMatrix = matrix.map((row) => [...row]);

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== null) {
        const boardX = pos.x + x;
        const boardY = pos.y + y;

        // Only place if within bounds
        if (boardX >= 0 && boardX < 10 && boardY >= 0 && boardY < 40) {
          newMatrix[boardY][boardX] = shape[y][x];
        }
      }
    }
  }

  return newMatrix;
}

/**
 * Clears full lines from the matrix.
 * Returns an object with the new matrix and the number of lines cleared.
 */
export function clearLines(matrix: Matrix): { newMatrix: Matrix; linesCleared: number } {
  const newMatrix: Matrix = [];
  let linesCleared = 0;

  for (let y = 0; y < 40; y++) {
    const isFull = matrix[y].every((cell) => cell !== null);
    if (isFull) {
      linesCleared++;
    } else {
      newMatrix.push([...matrix[y]]);
    }
  }

  // Add empty lines at the top for each cleared line
  for (let i = 0; i < linesCleared; i++) {
    newMatrix.unshift(Array(10).fill(null));
  }

  return { newMatrix, linesCleared };
}

/**
 * Calculates the y-coordinate for the ghost piece (where it would drop to).
 */
export function getDropPosition(matrix: Matrix, shape: Cell[][], pos: Point): Point {
  let currentY = pos.y;

  while (!checkCollision(matrix, shape, { x: pos.x, y: currentY + 1 })) {
    currentY++;
  }

  return { x: pos.x, y: currentY };
}
