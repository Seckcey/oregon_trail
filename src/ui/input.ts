// Shared text-field rules for every renderer, so both skins feed the sim
// identically: the same field limits and the same submit → action mapping
// (including the snack-run timing). Pure.

import type { Action, Screen } from '../sim/game';

export type InputKind = NonNullable<Screen['input']>['kind'];

export const INPUT_MAX_LENGTH: Record<InputKind, number> = { name: 16, epitaph: 60, snack: 24, email: 80 };

export function inputAction(kind: InputKind, value: string, elapsedMs: number): Action {
  switch (kind) {
    case 'name':
      return { type: 'SUBMIT_NAME', name: value };
    case 'epitaph':
      return { type: 'SUBMIT_EPITAPH', text: value };
    case 'snack':
      return { type: 'SNACK_SUBMIT', typed: value, ms: Math.round(elapsedMs) };
    case 'email':
      return { type: 'SUBMIT_EMAIL', email: value };
  }
}
