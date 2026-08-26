import { describe, it, expect } from 'vitest';

import { SHAPES, rotateShape, checkCollision, tryRotation } from '../srs';
import { createEmptyMatrix } from '../matrix';

describe('SRS Engine', () => {
  it('rotates shapes correctly (CW & CCW)', () => {
    const tShape = SHAPES['T'];

    // CW rotation
    const cwT = rotateShape(tShape, 1);
    expect(cwT).toEqual([
      [null, 'T', null],
      [null, 'T', 'T'],
      [null, 'T', null],
    ]);

    // CCW rotation from CW should be original
    const origT = rotateShape(cwT, -1);
    expect(origT).toEqual(tShape);
  });

  it('detects collisions correctly', () => {
    const matrix = createEmptyMatrix();
    const tShape = SHAPES['T'];

    // No collision in the middle
    expect(checkCollision(matrix, tShape, { x: 3, y: 19 })).toBe(false);

    // Collision with left wall
    expect(checkCollision(matrix, tShape, { x: -2, y: 19 })).toBe(true);

    // Collision with bottom wall
    expect(checkCollision(matrix, tShape, { x: 3, y: 39 })).toBe(true);

    // Collision with blocks
    matrix[20][4] = 'GARBAGE'; // The center 'T' block would hit this
    expect(checkCollision(matrix, tShape, { x: 3, y: 19 })).toBe(true);
  });

  it('performs basic rotation without kicks', () => {
    const matrix = createEmptyMatrix();
    const tShape = SHAPES['T'];

    const result = tryRotation('T', tShape, { x: 3, y: 19 }, 0, matrix, 1);
    expect(result.success).toBe(true);
    expect(result.kickIndex).toBe(0);
    expect(result.rotation).toBe(1);
    expect(result.position).toEqual({ x: 3, y: 19 });
  });

  it('applies wall kicks successfully', () => {
    const matrix = createEmptyMatrix();
    const tShape = SHAPES['T'];
    const cwT = rotateShape(tShape, 1);

    // Place a block that prevents a basic rotation
    // Current rotation 1 (pointing right)
    // T is at (3, 19). Center is (4, 20).
    // Rotating to 2 (pointing down) will put block at (3, 20) in un-kicked state
    matrix[20][3] = 'GARBAGE';

    const result = tryRotation('T', cwT, { x: 3, y: 19 }, 1, matrix, 1);
    expect(result.success).toBe(true);
    // Should kick right (+1, 0)
    // kick table for 1->2: [[0, 0], [+1, 0], ...]
    expect(result.kickIndex).toBe(1);
    expect(result.position).toEqual({ x: 4, y: 19 });
  });
});
