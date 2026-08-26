/**
 * Core types for the Tetris engine.
 * The matrix is 40 rows x 10 columns, with the top-left being (0,0).
 * Rows 0-19 are the invisible buffer zone, 20-39 are visible.
 */

export type PieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';
export type Cell = PieceType | 'GARBAGE' | null;
export type Matrix = Cell[][];

/**
 * Rotation state according to SRS:
 * 0: Spawn state
 * 1: State rotated 90 deg clockwise from Spawn
 * 2: State rotated 180 deg from Spawn
 * 3: State rotated 90 deg counter-clockwise from Spawn
 */
export type RotationState = 0 | 1 | 2 | 3;

/**
 * Coordinate in the matrix (top-left is 0,0).
 */
export interface Point {
  x: number; // Column index (0-9)
  y: number; // Row index (0-39)
}

/**
 * Kick offset as [x, y]. Note that our coordinate system has y increasing DOWN,
 * so standard SRS kicks (where +y is UP) will need their y-values inverted when applied.
 */
export type KickOffset = [number, number];

export type TSpinType = 'None' | 'Mini' | 'Regular';

export interface LockContext {
  piece: PieceType;
  position: Point; // Top-left of the piece's bounding box
  rotation: RotationState;
  lastMoveWasRotation: boolean;
  kickIndex: number; // 0 to 4, representing which kick offset succeeded
}

export interface TSpinResult {
  type: TSpinType;
  isB2BEligible: boolean; // True if Mini or Regular
}
