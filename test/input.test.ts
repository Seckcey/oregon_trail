import { describe, expect, it } from 'vitest';
import { INPUT_MAX_LENGTH, inputAction } from '../src/ui/input';

describe('inputAction — the one place a text field becomes a sim action', () => {
  it('maps a name field to SUBMIT_NAME', () => {
    expect(inputAction('name', 'Rosa', 999)).toEqual({ type: 'SUBMIT_NAME', name: 'Rosa' });
  });

  it('maps an epitaph field to SUBMIT_EPITAPH', () => {
    expect(inputAction('epitaph', 'Here lies the van', 999)).toEqual({ type: 'SUBMIT_EPITAPH', text: 'Here lies the van' });
  });

  it('maps a snack field to SNACK_SUBMIT with whole milliseconds', () => {
    expect(inputAction('snack', 'burrito', 1234.6)).toEqual({ type: 'SNACK_SUBMIT', typed: 'burrito', ms: 1235 });
  });

  it('keeps the Phase 1 field limits so both skins measure the same run', () => {
    expect(INPUT_MAX_LENGTH).toEqual({ name: 16, epitaph: 60, snack: 24, email: 80 });
  });
});
