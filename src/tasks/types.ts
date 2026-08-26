import type { PieceType } from '../engine/types';

export type TaskCategory = 'TSD_BASIC' | 'TST_KICK' | 'OPENER' | 'DOWNSTACK';

export type TargetAction =
  | 'T_SPIN_SINGLE'
  | 'T_SPIN_DOUBLE'
  | 'T_SPIN_TRIPLE'
  | 'T_SPIN_MINI'
  | 'ANY_T_SPIN';

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  targetAction: TargetAction;
  queue: PieceType[];
  holdAllowed?: boolean; // Default to false if not provided
  maxPieces?: number;
  boardString: string;
  hint?: string;
}
