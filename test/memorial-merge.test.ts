import { describe, expect, it } from 'vitest';
import { mergeMemorials } from '../src/ui/net/merge';
import type { Memorial } from '../src/sim/types';

const m = (mile: number, id?: string, epitaph = `E${mile}`): Memorial => ({ names: ['A'], mile, day: 1, cause: 'THIRST', epitaph, ...(id ? { id } : {}) });

describe('merging remote memorials with the local ones', () => {
  it('keeps every local memorial, with or without an id', () => {
    expect(mergeMemorials([m(10), m(20, 'L')], [])).toEqual([m(10), m(20, 'L')]);
  });
  it('adds remote memorials that are not already here', () => {
    expect(mergeMemorials([m(10)], [m(30, 'R1'), m(40, 'R2')])).toEqual([m(10), m(30, 'R1'), m(40, 'R2')]);
  });
  it('dedupes by id and local wins on a collision', () => {
    expect(mergeMemorials([m(20, 'X', 'MINE')], [m(21, 'X', 'THEIRS')])).toEqual([m(20, 'X', 'MINE')]);
  });
  it('dedupes within the remote list too', () => {
    expect(mergeMemorials([], [m(1, 'A'), m(2, 'A')])).toEqual([m(1, 'A')]);
  });
  it('sorts the result by mile so the first one on the road is the first passed', () => {
    expect(mergeMemorials([m(300)], [m(100, 'R'), m(200, 'S')]).map((x) => x.mile)).toEqual([100, 200, 300]);
  });
});
