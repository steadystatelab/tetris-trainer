import type { TaskDefinition } from '../types';

export const sampleTasks: TaskDefinition[] = [
  {
    id: 'tsd-basic-01',
    title: 'Standard TSD',
    description: 'Perform a basic T-Spin Double.',
    category: 'TSD_BASIC',
    targetAction: 'T_SPIN_DOUBLE',
    queue: ['T'],
    holdAllowed: false,
    boardString: `
      XXXXX_XXXX
      XXXX___XXX
      XXXXX_XXXX
      XXXXX_XXXX
    `,
    hint: 'Rotate the T piece into the slot to clear two lines.'
  },
  {
    id: 'tst-kick-01',
    title: 'TST Vertical Slot',
    description: 'Use a rotation kick to execute a T-Spin Triple.',
    category: 'TST_KICK',
    targetAction: 'T_SPIN_TRIPLE',
    queue: ['T'],
    holdAllowed: false,
    boardString: `
      XXX_XXXXXX
      XXX___XXXX
      XXXX__XXXX
      XXX___XXXX
      XXX_XXXXXX
    `,
    hint: 'Drop the T piece vertically, then rotate it to kick into the TST overhang.'
  },
  {
    id: 'neo-tsd-01',
    title: 'Neo-TSD',
    description: 'Execute a Neo T-Spin Double using a wall kick.',
    category: 'TSD_BASIC',
    targetAction: 'T_SPIN_DOUBLE',
    queue: ['T'],
    holdAllowed: false,
    boardString: `
      X________X
      XX_XXXXXXX
      XX___XXXXX
      XXX__XXXXX
      XXXX_XXXXX
    `,
    hint: 'Soft drop the T piece against the wall and rotate to kick it into the overhang.'
  }
];