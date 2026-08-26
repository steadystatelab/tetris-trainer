import { describe, it, expect } from 'vitest';

import { evaluateTSpin } from '../validator';
import { createEmptyMatrix } from '../matrix';

describe('T-Spin Validator', () => {
  it('rejects if not a T piece or not a rotation', () => {
    const matrix = createEmptyMatrix();

    expect(evaluateTSpin({
      piece: 'J', position: { x: 0, y: 0 }, rotation: 0, lastMoveWasRotation: true, kickIndex: 0
    }, matrix).type).toBe('None');

    expect(evaluateTSpin({
      piece: 'T', position: { x: 0, y: 0 }, rotation: 0, lastMoveWasRotation: false, kickIndex: 0
    }, matrix).type).toBe('None');
  });

  it('detects a Regular T-Spin (all corners filled)', () => {
    const matrix = createEmptyMatrix();
    // Center of T piece bounding box is at x=2, y=20 (so bounding box is at 1,19)
    // Corners:
    matrix[19][1] = 'GARBAGE'; // TL
    matrix[19][3] = 'GARBAGE'; // TR
    matrix[21][1] = 'GARBAGE'; // BL
    matrix[21][3] = 'GARBAGE'; // BR

    const result = evaluateTSpin({
      piece: 'T', position: { x: 1, y: 19 }, rotation: 0, lastMoveWasRotation: true, kickIndex: 0
    }, matrix);

    expect(result.type).toBe('Regular');
    expect(result.isB2BEligible).toBe(true);
  });

  it('detects a T-Spin Mini (only one front corner, 3 total)', () => {
    const matrix = createEmptyMatrix();
    // Rotation 0 (spawn, pointing UP). Front corners are TL and TR.
    matrix[19][1] = 'GARBAGE'; // TL (front)
    // TR is empty
    matrix[21][1] = 'GARBAGE'; // BL (back)
    matrix[21][3] = 'GARBAGE'; // BR (back)

    const result = evaluateTSpin({
      piece: 'T', position: { x: 1, y: 19 }, rotation: 0, lastMoveWasRotation: true, kickIndex: 0
    }, matrix);

    expect(result.type).toBe('Mini');
  });

  it('promotes a Mini to Regular via 5th kick', () => {
    const matrix = createEmptyMatrix();
    matrix[19][1] = 'GARBAGE'; // TL (front)
    matrix[21][1] = 'GARBAGE'; // BL (back)
    matrix[21][3] = 'GARBAGE'; // BR (back)

    const result = evaluateTSpin({
      piece: 'T', position: { x: 1, y: 19 }, rotation: 0, lastMoveWasRotation: true, kickIndex: 4 // 5th kick
    }, matrix);

    expect(result.type).toBe('Regular');
  });

  it('returns None for fewer than 3 corners', () => {
    const matrix = createEmptyMatrix();
    matrix[19][1] = 'GARBAGE'; // TL (front)
    matrix[21][1] = 'GARBAGE'; // BL (back)

    const result = evaluateTSpin({
      piece: 'T', position: { x: 1, y: 19 }, rotation: 0, lastMoveWasRotation: true, kickIndex: 0
    }, matrix);

    expect(result.type).toBe('None');
  });
});
