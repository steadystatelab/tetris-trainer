import { useEffect, useRef } from 'react';

type KeyAction = 'LEFT' | 'RIGHT' | 'DOWN' | 'HARD_DROP' | 'ROT_CW' | 'ROT_CCW' | 'HOLD' | 'RESET';

interface InputConfig {
  das: number; // Delayed Auto Shift (e.g., 133ms)
  arr: number; // Auto Repeat Rate (e.g., 10ms)
}

interface InputState {
  keys: Set<KeyAction>;
  shiftDir: 'LEFT' | 'RIGHT' | null;
  shiftTimer: number; // Accumulated time for DAS/ARR
  dasActive: boolean; // Has the initial DAS delay passed?
}

export function useInput(
  onAction: (action: KeyAction) => void,
  config: InputConfig = { das: 133, arr: 10 }
) {
  const stateRef = useRef<InputState>({
    keys: new Set(),
    shiftDir: null,
    shiftTimer: 0,
    dasActive: false,
  });

  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const keyMap: Record<string, KeyAction> = {
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      ArrowDown: 'DOWN',
      ' ': 'HARD_DROP',
      ArrowUp: 'ROT_CW',
      x: 'ROT_CW',
      X: 'ROT_CW',
      z: 'ROT_CCW',
      Z: 'ROT_CCW',
      Control: 'ROT_CCW',
      c: 'HOLD',
      C: 'HOLD',
      Shift: 'HOLD',
      r: 'RESET',
      R: 'RESET',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const action = keyMap[e.key];
      if (!action) return;

      // Prevent default scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const state = stateRef.current;

      // Ensure single-trigger actions don't auto-repeat from OS
      if (e.repeat && action !== 'LEFT' && action !== 'RIGHT' && action !== 'DOWN') {
        return;
      }

      if (!state.keys.has(action)) {
        state.keys.add(action);

        // Initial trigger for everything
        onAction(action);

        if (action === 'LEFT' || action === 'RIGHT') {
          // If we press a new direction, override the shift direction and reset DAS
          state.shiftDir = action;
          state.shiftTimer = 0;
          state.dasActive = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = keyMap[e.key];
      if (!action) return;

      const state = stateRef.current;
      state.keys.delete(action);

      if (action === 'LEFT' || action === 'RIGHT') {
        if (state.shiftDir === action) {
          // If the released key was the active shift direction, check if the other is still held
          if (state.keys.has('LEFT')) {
            state.shiftDir = 'LEFT';
            state.shiftTimer = 0;
            state.dasActive = false;
          } else if (state.keys.has('RIGHT')) {
            state.shiftDir = 'RIGHT';
            state.shiftTimer = 0;
            state.dasActive = false;
          } else {
            state.shiftDir = null;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onAction]);

  useEffect(() => {
    // Game Loop for continuous input processing (DAS/ARR, Soft Drop)
    const loop = (time: number) => {
      const state = stateRef.current;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Handle continuous soft drop
      if (state.keys.has('DOWN')) {
        onAction('DOWN');
      }

      // Handle DAS / ARR for LEFT/RIGHT
      if (state.shiftDir) {
        state.shiftTimer += dt;

        if (!state.dasActive) {
          if (state.shiftTimer >= config.das) {
            state.dasActive = true;
            state.shiftTimer -= config.das; // keep remainder for ARR
            onAction(state.shiftDir); // first ARR trigger
          }
        }

        if (state.dasActive) {
          if (config.arr === 0) {
            for (let i = 0; i < 10; i++) {
              onAction(state.shiftDir);
            }
          } else {
            // Standard ARR timing
            while (state.shiftTimer >= config.arr) {
              state.shiftTimer -= config.arr;
              onAction(state.shiftDir);
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame((t) => {
      lastTimeRef.current = t;
      loop(t);
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [onAction, config]);
}