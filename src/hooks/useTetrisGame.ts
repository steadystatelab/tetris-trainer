import { useState, useCallback, useRef, useEffect } from 'react';
import type { Matrix, PieceType, Point, RotationState, Cell, LockContext } from '../engine/types';
import { SHAPES, tryRotation, checkCollision } from '../engine/srs';
import { placePiece, clearLines, getDropPosition } from '../engine/matrix';
import { evaluateTSpin } from '../engine/validator';
import type { TaskDefinition } from '../tasks/types';
import { parseASCIIBoard } from '../tasks/loader';

export type TaskStatus = 'IN_PROGRESS' | 'PASSED' | 'FAILED';

export interface GameState {
  matrix: Matrix;
  activePiece: PieceType | null;
  activeShape: Cell[][] | null;
  activePos: Point;
  activeRot: RotationState;
  ghostPos: Point;
  queue: PieceType[];
  holdPiece: PieceType | null;
  canHold: boolean;
  taskStatus: TaskStatus;
}

export function useTetrisGame(task: TaskDefinition) {
  const [state, setState] = useState<GameState>({
    matrix: [],
    activePiece: null,
    activeShape: null,
    activePos: { x: 0, y: 0 },
    activeRot: 0,
    ghostPos: { x: 0, y: 0 },
    queue: [],
    holdPiece: null,
    canHold: true,
    taskStatus: 'IN_PROGRESS',
  });

  // Timers and counters
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveResetCountRef = useRef(0);
  const lockContextRef = useRef<LockContext | null>(null);

  const getSpawnPos = (piece: PieceType): Point => {
    if (piece === 'I') return { x: 3, y: 18 };
    if (piece === 'O') return { x: 4, y: 19 };
    return { x: 3, y: 19 }; // J, L, S, T, Z
  };

  const spawnPiece = useCallback((
    piece: PieceType,
    currentMatrix: Matrix,
    currentQueue: PieceType[],
    holdPiece: PieceType | null,
    canHold: boolean
  ) => {
    const shape = SHAPES[piece];
    const pos = getSpawnPos(piece);

    // If it collides immediately on spawn, game over / failed
    if (checkCollision(currentMatrix, shape, pos)) {
      setState(prev => ({ ...prev, taskStatus: 'FAILED' }));
      return;
    }

    const ghost = getDropPosition(currentMatrix, shape, pos);

    setState({
      matrix: currentMatrix,
      activePiece: piece,
      activeShape: shape,
      activePos: pos,
      activeRot: 0,
      ghostPos: ghost,
      queue: currentQueue,
      holdPiece,
      canHold,
      taskStatus: 'IN_PROGRESS'
    });

    moveResetCountRef.current = 0;
    lockContextRef.current = {
      piece,
      position: pos,
      rotation: 0,
      lastMoveWasRotation: false,
      kickIndex: 0
    };
  }, []);

  // Initialize or Reset the game
  const resetTask = useCallback(() => {
    const initialMatrix = parseASCIIBoard(task.boardString);
    const initialQueue = [...task.queue];
    const firstPiece = initialQueue.shift() || null;

    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    moveResetCountRef.current = 0;
    lockContextRef.current = null;

    if (!firstPiece) {
      // Nothing to play
      setState({
        matrix: initialMatrix,
        activePiece: null,
        activeShape: null,
        activePos: { x: 0, y: 0 },
        activeRot: 0,
        ghostPos: { x: 0, y: 0 },
        queue: [],
        holdPiece: null,
        canHold: false,
        taskStatus: 'FAILED',
      });
      return;
    }

    spawnPiece(firstPiece, initialMatrix, initialQueue, null, true);
  }, [task, spawnPiece]);

  // Initial load
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
        resetTask();
        hasInitialized.current = true;
    }
  }, [resetTask]);

  const setLockTimer = useCallback((lockFn: () => void) => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);

    // Hard limit on resets
    if (moveResetCountRef.current >= 15) {
      lockFn();
      return;
    }

    lockTimerRef.current = setTimeout(lockFn, 500);
  }, []);

  const clearLockTimer = useCallback(() => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = null;
  }, []);

  const executeLock = useCallback(() => {
    setState(prev => {
      if (prev.taskStatus !== 'IN_PROGRESS' || !prev.activePiece || !prev.activeShape || !lockContextRef.current) return prev;

      const newMatrixWithPiece = placePiece(prev.matrix, prev.activeShape, prev.activePos);
      const { newMatrix, linesCleared } = clearLines(newMatrixWithPiece);

      const tspinResult = evaluateTSpin(lockContextRef.current, prev.matrix);

      let isSuccess = false;

      // Evaluate task condition
      if (linesCleared > 0) {
        switch (task.targetAction) {
          case 'T_SPIN_SINGLE':
            isSuccess = linesCleared === 1 && tspinResult.type === 'Regular';
            break;
          case 'T_SPIN_DOUBLE':
            isSuccess = linesCleared === 2 && tspinResult.type === 'Regular';
            break;
          case 'T_SPIN_TRIPLE':
            isSuccess = linesCleared === 3 && tspinResult.type === 'Regular';
            break;
          case 'T_SPIN_MINI':
            // Technically a mini single/double, but standard rule checks if it's a Mini type
            isSuccess = tspinResult.type === 'Mini';
            break;
          case 'ANY_T_SPIN':
            isSuccess = tspinResult.type !== 'None';
            break;
        }
      }

      if (isSuccess) {
        return { ...prev, matrix: newMatrix, taskStatus: 'PASSED', activePiece: null, activeShape: null };
      }

      // If we didn't succeed, and we have no more pieces, or we cleared lines but didn't meet the goal
      if (prev.queue.length === 0 || linesCleared > 0) {
        return { ...prev, matrix: newMatrix, taskStatus: 'FAILED', activePiece: null, activeShape: null };
      }

      // Next piece
      const nextQueue = [...prev.queue];
      const nextPiece = nextQueue.shift();

      if (!nextPiece) {
        return { ...prev, matrix: newMatrix, taskStatus: 'FAILED', activePiece: null, activeShape: null };
      }

      // This is a bit of a hack in React's set state loop, so we schedule the next piece to be spawned outside
      setTimeout(() => {
        spawnPiece(nextPiece, newMatrix, nextQueue, prev.holdPiece, true);
      }, 0);

      return {
        ...prev,
        matrix: newMatrix,
        activePiece: null,
        activeShape: null,
      };
    });
  }, [task, spawnPiece]);

  const move = useCallback((dx: number, dy: number) => {
    setState(prev => {
      if (prev.taskStatus !== 'IN_PROGRESS' || !prev.activePiece || !prev.activeShape) return prev;

      const nextPos = { x: prev.activePos.x + dx, y: prev.activePos.y + dy };

      if (!checkCollision(prev.matrix, prev.activeShape, nextPos)) {
        if (lockContextRef.current) {
          lockContextRef.current.position = nextPos;
          lockContextRef.current.lastMoveWasRotation = false;
        }

        // Lock delay handling
        const isTouchingGround = checkCollision(prev.matrix, prev.activeShape, { x: nextPos.x, y: nextPos.y + 1 });

        if (isTouchingGround) {
           // We just moved, increment reset if we were already touching ground (e.g. sliding)
           // But if dy > 0 (soft drop), usually it doesn't reset move counter, but moving horizontally does.
           if (dx !== 0) moveResetCountRef.current++;
           setLockTimer(executeLock);
        } else {
           clearLockTimer();
        }

        return {
          ...prev,
          activePos: nextPos,
          ghostPos: getDropPosition(prev.matrix, prev.activeShape, nextPos)
        };
      } else if (dy > 0 && dx === 0) {
        // Soft drop hit the floor
        // The piece is already at its lowest possible non-colliding pos (prev.activePos)
        // If it was just hitting the ground now, start timer or lock instantly depending on rules
        // Standard guideline: soft drop to floor starts lock delay, but if you keep holding it doesn't instantly lock unless you hard drop
        setLockTimer(executeLock);
      }

      return prev;
    });
  }, [executeLock, setLockTimer, clearLockTimer]);

  const rotate = useCallback((dir: 1 | -1) => {
    setState(prev => {
      if (prev.taskStatus !== 'IN_PROGRESS' || !prev.activePiece || !prev.activeShape) return prev;

      const result = tryRotation(prev.activePiece, prev.activeShape, prev.activePos, prev.activeRot, prev.matrix, dir);

      if (result.success && result.shape && result.position && result.rotation !== null) {
        if (lockContextRef.current) {
          lockContextRef.current.position = result.position;
          lockContextRef.current.rotation = result.rotation;
          lockContextRef.current.lastMoveWasRotation = true;
          lockContextRef.current.kickIndex = result.kickIndex;
        }

        moveResetCountRef.current++;

        const isTouchingGround = checkCollision(prev.matrix, result.shape, { x: result.position.x, y: result.position.y + 1 });
        if (isTouchingGround) {
           setLockTimer(executeLock);
        } else {
           clearLockTimer();
        }

        return {
          ...prev,
          activeShape: result.shape,
          activePos: result.position,
          activeRot: result.rotation,
          ghostPos: getDropPosition(prev.matrix, result.shape, result.position)
        };
      }

      return prev;
    });
  }, [executeLock, setLockTimer, clearLockTimer]);

  const hardDrop = useCallback(() => {
    setState(prev => {
      if (prev.taskStatus !== 'IN_PROGRESS' || !prev.activePiece || !prev.activeShape) return prev;

      const dropPos = getDropPosition(prev.matrix, prev.activeShape, prev.activePos);

      if (lockContextRef.current) {
        lockContextRef.current.position = dropPos;
        // Hard dropping does not change the "lastMoveWasRotation" flag in most guidelines!
        // But some trainers reset it. We'll leave it as is, because sliding and then dropping is still a spin if the drop distance is 0.
        // Actually, if it dropped more than 0 distance, last move wasn't a rotation.
        if (dropPos.y > prev.activePos.y) {
          lockContextRef.current.lastMoveWasRotation = false;
        }
      }

      // Execute lock instantly
      // Schedule lock immediately instead of using state dependency loop
      setTimeout(executeLock, 0);

      return {
        ...prev,
        activePos: dropPos
      };
    });
  }, [executeLock]);

  const hold = useCallback(() => {
    setState(prev => {
      if (prev.taskStatus !== 'IN_PROGRESS' || !task.holdAllowed || !prev.canHold || !prev.activePiece) return prev;

      const currentPiece = prev.activePiece;
      const nextPiece = prev.holdPiece ?? prev.queue[0];
      const nextQueue = prev.holdPiece ? prev.queue : prev.queue.slice(1);

      if (!nextPiece) {
        return { ...prev, taskStatus: 'FAILED' };
      }

      // Use a timeout to avoid doing this mid-render
      setTimeout(() => {
        spawnPiece(nextPiece, prev.matrix, nextQueue, currentPiece, false);
      }, 0);

      return {
        ...prev,
        activePiece: null,
        activeShape: null,
      };
    });
  }, [task, spawnPiece]);

  return {
    state,
    resetTask,
    moveLeft: () => move(-1, 0),
    moveRight: () => move(1, 0),
    moveDown: () => move(0, 1),
    rotateCW: () => rotate(1),
    rotateCCW: () => rotate(-1),
    hardDrop,
    hold
  };
}