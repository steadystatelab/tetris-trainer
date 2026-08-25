export type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

// 0 = Empty, 1-7 = Tetromino types, 8 = Garbage / Grey block
export type MinoValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Standard matrix: 20 visible rows x 10 columns (top is row 0, bottom is row 19)
// Buffer zone: 20 hidden rows above (rows 0-19 buffer, 20-39 visible if using 40-row array)
export type Matrix = MinoValue[][];

export type RotationState = 0 | 1 | 2 | 3; // 0 = Spawn, 1 = R (90° CW), 2 = 2 (180°), 3 = L (270° CCW)

export interface Point {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: PieceType;
  position: Point; // Bounding box top-left corner on the matrix
  rotation: RotationState;
}

export type KickOffset = [number, number]; // [dx, dy] where +x is right, +y is up in standard SRS

export type TSpinResult =
  | 'NONE'
  | 'T_SPIN_MINI'
  | 'T_SPIN_SINGLE'
  | 'T_SPIN_DOUBLE'
  | 'T_SPIN_TRIPLE';

export interface LockContext {
  piece: ActivePiece;
  lastActionWasRotation: boolean;
  kickIndexUsed: number; // 0 = basic rotation, 1..4 = kick table test index
  linesCleared: number;
}