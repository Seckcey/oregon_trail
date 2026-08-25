import { describe, expect, it } from 'vitest';
import { LIMITS, validateMemorial } from '../src/validate.ts';

const good = { runId: '4c1d3f0a-2b7e-4c0d-9d6e-1f2a3b4c5d6e', mile: 212, day: 14, cause: 'THIRST', names: ['Dana', 'Wes'], epitaph: 'REST EASY, DANA' };

describe('the memorial body against the shared limits', () => {
  it('accepts every cause the sim can produce', () => {
    for (const cause of LIMITS.causes) {
      const r = validateMemorial({ ...good, cause });
      expect(r.ok, cause).toBe(true);
    }
  });
  it('rejects an unknown cause', () => {
    expect(validateMemorial({ ...good, cause: 'DIABETES' })).toEqual({ ok: false, error: 'bad-cause' });
    expect(validateMemorial({ ...good, cause: 'thirst' }).ok).toBe(false);
  });
  it('bounds mile 0–730 and day 1–400, integers only', () => {
    expect(validateMemorial({ ...good, mile: 0 }).ok).toBe(true);
    expect(validateMemorial({ ...good, mile: 730 }).ok).toBe(true);
    expect(validateMemorial({ ...good, mile: 731 })).toEqual({ ok: false, error: 'bad-mile' });
    expect(validateMemorial({ ...good, mile: -1 }).ok).toBe(false);
    expect(validateMemorial({ ...good, mile: 1.5 }).ok).toBe(false);
    expect(validateMemorial({ ...good, day: 0 })).toEqual({ ok: false, error: 'bad-day' });
    expect(validateMemorial({ ...good, day: 401 }).ok).toBe(false);
  });
  it('needs a run id that looks like a uuid', () => {
    expect(validateMemorial({ ...good, runId: 'nope' })).toEqual({ ok: false, error: 'bad-run-id' });
    expect(validateMemorial({ ...good, runId: undefined })).toEqual({ ok: false, error: 'bad-run-id' });
  });
  it('needs 1–5 names, each a string of 1–16 chars, and a string epitaph', () => {
    expect(validateMemorial({ ...good, names: [] })).toEqual({ ok: false, error: 'bad-names' });
    expect(validateMemorial({ ...good, names: ['a', 'b', 'c', 'd', 'e', 'f'] }).ok).toBe(false);
    expect(validateMemorial({ ...good, names: [42] }).ok).toBe(false);
    expect(validateMemorial({ ...good, names: ['x'.repeat(17)] }).ok).toBe(false);
    expect(validateMemorial({ ...good, epitaph: 7 })).toEqual({ ok: false, error: 'bad-epitaph' });
    expect(validateMemorial({ ...good, epitaph: 'x'.repeat(61) }).ok).toBe(false);
  });
  it('rejects anything that is not an object', () => {
    expect(validateMemorial(null).ok).toBe(false);
    expect(validateMemorial('hi').ok).toBe(false);
  });
  it('returns the typed body on success, nothing extra', () => {
    const r = validateMemorial({ ...good, extra: 1 });
    expect(r).toEqual({ ok: true, value: good });
  });
});
