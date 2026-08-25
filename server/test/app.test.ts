import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.ts';

describe('the API boots with no env at all', () => {
  it('GET /api/health → 200 { ok: true }', async () => {
    const app = createApp({ dbPath: ':memory:', env: {} });
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
