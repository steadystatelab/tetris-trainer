import { Matrix, PieceType, Point, RotationState, KickOffset, Cell } from './types';

// Standard Tetromino shapes in their spawn (0) orientation.
// Bounding boxes: I (4x4), O (2x2), others (3x3).
export const SHAPES: Record<PieceType, Cell[][]> = {
  I: [
    [null, null, null, null],
    ['I', 'I', 'I', 'I'],
    [null, null, null, null],
    [null, null, null, null],
  ],
  J: [
    ['J', null, null],
    ['J', 'J', 'J'],
    [null, null, null],
  ],
  L: [
    [null, null, 'L'],
    ['L', 'L', 'L'],
    [null, null, null],
  ],
  O: [
    ['O', 'O'],
    ['O', 'O'],
  ],
  S: [
    [null, 'S', 'S'],
    ['S', 'S', null],
    [null, null, null],
  ],
  T: [
    [null, 'T', null],
    ['T', 'T', 'T'],
    [null, null, null],
  ],
  Z: [
    ['Z', 'Z', null],
    [null, 'Z', 'Z'],
    [null, null, null],
  ],
};

// Returns a new grid rotated clockwise (dir=1) or counter-clockwise (dir=-1).
export function rotateShape(shape: Cell[][], dir: 1 | -1): Cell[][] {
  const size = shape.length;
  const newShape: Cell[][] = Array.from({ length: size }, () => Array(size).fill(null));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (dir === 1) {
        newShape[x][size - 1 - y] = shape[y][x];
      } else {
        newShape[size - 1 - x][y] = shape[y][x];
      }
    }
  }
  return newShape;
}

// Calculate the new rotation state
export function getNextRotation(current: RotationState, dir: 1 | -1): RotationState {
  return ((current + dir + 4) % 4) as RotationState;
}

// Check if a piece at a given position and shape collides with the matrix or boundaries
export function checkCollision(matrix: Matrix, shape: Cell[][], pos: Point): boolean {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== null) {
        const boardX = pos.x + x;
        const boardY = pos.y + y;

        // Check bounds
        if (boardX < 0 || boardX >= 10 || boardY < 0 || boardY >= 40) {
          return true;
        }

        // Check block overlap
        if (matrix[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// Official SRS Kick Data.
// Format is [x, y], where +x is right and +y is UP in the official specification.
// Since our board has +y going DOWN, we will negate the y value when applying.
type KickTable = Record<string, KickOffset[]>; // Key is "currentState->nextState"

const KICKS_JLSTZ: KickTable = {
  '0->1': [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
  '1->2': [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
  '2->1': [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
  '0->3': [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
};

const KICKS_I: KickTable = {
  '0->1': [[0, 0], [-2, 0], [+1, 0], [-2, -1], [+1, +2]],
  '1->0': [[0, 0], [+2, 0], [-1, 0], [+2, +1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [+2, 0], [-1, +2], [+2, -1]],
  '2->1': [[0, 0], [+1, 0], [-2, 0], [+1, -2], [-2, +1]],
  '2->3': [[0, 0], [+2, 0], [-1, 0], [+2, +1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [+1, 0], [-2, -1], [+1, +2]],
  '3->0': [[0, 0], [+1, 0], [-2, 0], [+1, -2], [-2, +1]],
  '0->3': [[0, 0], [-1, 0], [+2, 0], [-1, +2], [+2, -1]],
};

// O piece doesn't really kick or rotate, but for completeness.
const KICKS_O: KickTable = {
  '0->1': [[0, 0]], '1->0': [[0, 0]], '1->2': [[0, 0]], '2->1': [[0, 0]],
  '2->3': [[0, 0]], '3->2': [[0, 0]], '3->0': [[0, 0]], '0->3': [[0, 0]],
};

export interface RotationAttemptResult {
  success: boolean;
  shape: Cell[][] | null;
  position: Point | null;
  rotation: RotationState | null;
  kickIndex: number;
}

export function tryRotation(
  piece: PieceType,
  currentShape: Cell[][],
  currentPos: Point,
  currentRot: RotationState,
  matrix: Matrix,
  dir: 1 | -1
): RotationAttemptResult {
  const nextRot = getNextRotation(currentRot, dir);
  const nextShape = rotateShape(currentShape, dir);

  let kickTable: KickTable;
  if (piece === 'I') {
    kickTable = KICKS_I;
  } else if (piece === 'O') {
    kickTable = KICKS_O;
  } else {
    kickTable = KICKS_JLSTZ;
  }

  const key = `${currentRot}->${nextRot}`;
  const kicks = kickTable[key];

  for (let i = 0; i < kicks.length; i++) {
    const [kickX, kickY] = kicks[i];

    // Convert SRS coordinates to our matrix coordinates
    // +x is right (same), +y in SRS is UP, but in our matrix UP is -y.
    // So to move UP (positive kickY), we subtract kickY from currentPos.y
    const newPos = {
      x: currentPos.x + kickX,
      y: currentPos.y - kickY
    };

    if (!checkCollision(matrix, nextShape, newPos)) {
      return {
        success: true,
        shape: nextShape,
        position: newPos,
        rotation: nextRot,
        kickIndex: i,
      };
    }
  }

  return {
    success: false,
    shape: null,
    position: null,
    rotation: null,
    kickIndex: -1,
  };
}
