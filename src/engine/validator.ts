import { Matrix, Point, RotationState, TSpinResult, TSpinType, LockContext } from './types';

function isOccupied(matrix: Matrix, x: number, y: number): boolean {
  // Out of bounds is considered occupied (for wall kicks and corner checks)
  if (x < 0 || x >= 10 || y < 0 || y >= 40) {
    return true;
  }
  return matrix[y][x] !== null;
}

/**
 * Validates a T-Spin based on the 3-corner rule.
 *
 * Rules:
 * 1. The last action before locking must have been a successful rotation.
 * 2. At least 3 of the 4 diagonal corners around the T-piece center must be occupied.
 * 3. Differentiating Regular vs Mini:
 *    - If both "front" corners (the side the T points to) are occupied -> Regular.
 *    - If only 1 front corner is occupied -> Mini.
 *    - EXCEPT: If the 5th kick (index 4) was used to succeed the rotation, it's ALWAYS promoted to a Regular T-Spin.
 */
export function evaluateTSpin(context: LockContext, matrix: Matrix): TSpinResult {
  if (context.piece !== 'T' || !context.lastMoveWasRotation) {
    return { type: 'None', isB2BEligible: false };
  }

  // The T piece bounding box is 3x3. The center is always at (1, 1) relative to the top-left of its box.
  const center: Point = { x: context.position.x + 1, y: context.position.y + 1 };

  // Corners relative to the center
  const corners = {
    topLeft: isOccupied(matrix, center.x - 1, center.y - 1),
    topRight: isOccupied(matrix, center.x + 1, center.y - 1),
    bottomLeft: isOccupied(matrix, center.x - 1, center.y + 1),
    bottomRight: isOccupied(matrix, center.x + 1, center.y + 1),
  };

  const occupiedCount = [
    corners.topLeft,
    corners.topRight,
    corners.bottomLeft,
    corners.bottomRight,
  ].filter(Boolean).length;

  if (occupiedCount < 3) {
    return { type: 'None', isB2BEligible: false };
  }

  // Determine front corners based on rotation state
  // 0: Spawn (T pointing UP) -> front corners are Top-Left and Top-Right
  // 1: Right (T pointing RIGHT) -> front corners are Top-Right and Bottom-Right
  // 2: Inverted (T pointing DOWN) -> front corners are Bottom-Left and Bottom-Right
  // 3: Left (T pointing LEFT) -> front corners are Top-Left and Bottom-Left
  let frontA = false;
  let frontB = false;

  switch (context.rotation) {
    case 0:
      frontA = corners.topLeft;
      frontB = corners.topRight;
      break;
    case 1:
      frontA = corners.topRight;
      frontB = corners.bottomRight;
      break;
    case 2:
      frontA = corners.bottomLeft;
      frontB = corners.bottomRight;
      break;
    case 3:
      frontA = corners.topLeft;
      frontB = corners.bottomLeft;
      break;
  }

  let type: TSpinType = 'None';

  if (frontA && frontB) {
    type = 'Regular';
  } else {
    // If we only have 1 front corner, it's normally a Mini
    type = 'Mini';

    // OVERRIDE: If the 5th kick (index 4) was used, promote to Regular
    if (context.kickIndex === 4) {
      type = 'Regular';
    }
  }

  return {
    type,
    isB2BEligible: type !== 'None',
  };
}
