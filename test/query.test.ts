import { describe, expect, it } from 'vitest';
import { parseQuery } from '../src/ui/query';

describe('parseQuery', () => {
  it('returns nulls for an empty or absent query string', () => {
    expect(parseQuery('')).toEqual({ theme: null, seed: null });
    expect(parseQuery('?')).toEqual({ theme: null, seed: null });
  });

  it('reads a valid ?theme=', () => {
    expect(parseQuery('?theme=heritage').theme).toBe('heritage');
    expect(parseQuery('?theme=coastal').theme).toBe('coastal');
  });

  it('ignores an unknown ?theme=', () => {
    expect(parseQuery('?theme=neon').theme).toBeNull();
    expect(parseQuery('?theme=').theme).toBeNull();
  });

  it('reads a ?seed= and trims it', () => {
    expect(parseQuery('?seed=abc123').seed).toBe('abc123');
    expect(parseQuery('?seed=%20spaced%20').seed).toBe('spaced');
  });

  it('drops an empty or absurdly long seed', () => {
    expect(parseQuery('?seed=').seed).toBeNull();
    expect(parseQuery('?seed=%20%20').seed).toBeNull();
    expect(parseQuery(`?seed=${'x'.repeat(65)}`).seed).toBeNull();
    expect(parseQuery(`?seed=${'x'.repeat(64)}`).seed).toBe('x'.repeat(64));
  });

  it('reads both together in any order', () => {
    expect(parseQuery('?seed=s1&theme=heritage')).toEqual({ theme: 'heritage', seed: 's1' });
    expect(parseQuery('?theme=heritage&seed=s1')).toEqual({ theme: 'heritage', seed: 's1' });
  });
});
