import { describe, expect, it } from 'vitest';
import { RateLimiter } from '../src/ratelimit.ts';

describe('the token bucket', () => {
  it('allows `burst` hits then refuses, and refills over the window', () => {
    const rl = new RateLimiter({ burst: 3, perMs: 60_000 });
    let t = 0;
    expect([rl.take('k', t), rl.take('k', t), rl.take('k', t), rl.take('k', t)]).toEqual([true, true, true, false]);
    t += 20_000; // one token back
    expect(rl.take('k', t)).toBe(true);
    expect(rl.take('k', t)).toBe(false);
    t += 60_000; // full again (never above burst)
    expect([rl.take('k', t), rl.take('k', t), rl.take('k', t), rl.take('k', t)]).toEqual([true, true, true, false]);
  });
  it('keys are independent', () => {
    const rl = new RateLimiter({ burst: 1, perMs: 1000 });
    expect(rl.take('a', 0)).toBe(true);
    expect(rl.take('b', 0)).toBe(true);
    expect(rl.take('a', 0)).toBe(false);
  });
  it('forgets idle keys on sweep so memory stays flat', () => {
    const rl = new RateLimiter({ burst: 1, perMs: 1000 });
    rl.take('a', 0);
    rl.sweep(5000);
    expect(rl.size).toBe(0);
  });
});
