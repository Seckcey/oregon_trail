import { describe, expect, it } from 'vitest';
import { clientIp, hashIp } from '../src/iphash.ts';

describe('the daily-salted IP hash', () => {
  const a = new Date('2026-08-25T23:59:00Z');
  const b = new Date('2026-08-26T00:01:00Z');
  it('is stable within a day and different across days', () => {
    expect(hashIp('1.2.3.4', 'secret', a)).toBe(hashIp('1.2.3.4', 'secret', a));
    expect(hashIp('1.2.3.4', 'secret', a)).not.toBe(hashIp('1.2.3.4', 'secret', b));
  });
  it('depends on the secret and on the address', () => {
    expect(hashIp('1.2.3.4', 'secret', a)).not.toBe(hashIp('1.2.3.4', 'other', a));
    expect(hashIp('1.2.3.4', 'secret', a)).not.toBe(hashIp('1.2.3.5', 'secret', a));
  });
  it('is hex and does not contain the address', () => {
    const h = hashIp('1.2.3.4', 'secret', a);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).not.toContain('1.2.3.4');
  });
  it('reads the client from X-Forwarded-For (first hop) or CF-Connecting-IP', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9');
    expect(clientIp(new Headers({ 'cf-connecting-ip': '203.0.113.7' }))).toBe('203.0.113.7');
    expect(clientIp(new Headers())).toBe('0.0.0.0');
  });
});
