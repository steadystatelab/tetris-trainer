import { PieceType, RotationState, KickOffset, Matrix, Point } from './types';

// Standard 4x4 bounding box for I, 2x2 for O, 3x3 for J, L, S, T, Z
export const PIECE_SHAPES: Record<PieceType, Record<RotationState, number[][]>> = {
  I: {
    0: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    1: [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    2: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    3: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  },
  T: {
    0: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    3: [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  J: {
    0: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    3: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  },
  L: {
    0: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    3: [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  },
  S: {
    0: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    1: [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    2: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    3: [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  Z: {
    0: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    1: [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    2: [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    3: [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
  O: {
    0: [
      [1, 1],
      [1, 1],
    ],
    1: [
      [1, 1],
      [1, 1],
    ],
    2: [
      [1, 1],
      [1, 1],
    ],
    3: [
      [1, 1],
      [1, 1],
    ],
  },
};

// Standard SRS Wall Kick Table for J, L, S, T, Z
// Key format: `${fromRotation}->${toRotation}`
// Vectors are [dx, dy] where +x = right, +y = UP (in standard math grid)
export const JLSTZ_WALLKICK_TABLE: Record<string, KickOffset[]> = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// Standard SRS Wall Kick Table for I piece
export const I_WALLKICK_TABLE: Record<string, KickOffset[]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

/**
 * Checks if a piece shape intersects with occupied blocks or boundaries.
 */
export function checkCollision(
  matrix: Matrix,
  shape: number[][],
  pos: Point,
  boardWidth = 10,
  boardHeight = 20
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const x = pos.x + c;
        const y = pos.y + r;

        if (x < 0 || x >= boardWidth || y >= boardHeight) {
          return true; // Wall or floor collision
        }
        if (y >= 0 && matrix[y][x] !== 0) {
          return true; // Overlap with settled mino
        }
      }
    }
  }
  return false;
}

/**
 * Attempts rotation applying the 5 SRS test kicks.
 * Note: Since array row indices increase DOWNWARDS, dy is inverted (-dy).
 */
export function tryRotation(
  matrix: Matrix,
  pieceType: PieceType,
  currentPos: Point,
  fromRot: RotationState,
  toRot: RotationState
): { success: boolean; newPos: Point; kickIndex: number } {
  if (pieceType === 'O') {
    return { success: true, newPos: { ...currentPos }, kickIndex: 0 };
  }

  const kicks =
    pieceType === 'I'
      ? I_WALLKICK_TABLE[`${fromRot}->${toRot}`]
      : JLSTZ_WALLKICK_TABLE[`${fromRot}->${toRot}`];

  const targetShape = PIECE_SHAPES[pieceType][toRot];

  for (let i = 0; i < kicks.length; i++) {
    const [dx, dy] = kicks[i];
    const testPos: Point = {
      x: currentPos.x + dx,
      y: currentPos.y - dy, // Convert standard math upward vector to matrix row index
    };

    if (!checkCollision(matrix, targetShape, testPos)) {
      return { success: true, newPos: testPos, kickIndex: i };
    }
  }

  return { success: false, newPos: currentPos, kickIndex: -1 };
}