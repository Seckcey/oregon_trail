import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';

const body = { runId: '4c1d3f0a-2b7e-4c0d-9d6e-1f2a3b4c5d6e', mile: 212, day: 14, cause: 'THIRST', names: ['Dana'], epitaph: 'X' };
const post = (app: App, i: number, ip = '10.0.0.1') =>
  app.request('/api/memorials', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify({ ...body, runId: body.runId.slice(0, -2) + String(i).padStart(2, '0') }),
  });

describe('rate limits on the routes', () => {
  it('six memorial posts an hour per address, then 429; another address is fine', async () => {
    const app = createApp({ dbPath: ':memory:' });
    for (let i = 0; i < 6; i++) expect((await post(app, i)).status).toBe(201);
    expect((await post(app, 6)).status).toBe(429);
    expect((await post(app, 7, '10.0.0.2')).status).toBe(201);
  });
  it('sixty GETs a minute, then 429', async () => {
    const app = createApp({ dbPath: ':memory:' });
    for (let i = 0; i < 60; i++) expect((await app.request('/api/memorials?seed=x', { headers: { 'x-forwarded-for': '10.0.0.3' } })).status).toBe(200);
    expect((await app.request('/api/memorials?seed=x', { headers: { 'x-forwarded-for': '10.0.0.3' } })).status).toBe(429);
  });
  it('twenty reports a day, then 429', async () => {
    const app = createApp({ dbPath: ':memory:' });
    for (let i = 0; i < 25; i++) {
      app.db.run(`insert into memorials (id, run_id, mile, day, cause, names, epitaph, created_at) values (?, ?, 1, 1, 'THIRST', '["A"]', 'E', 'now')`, [`M${i}`, `r${i}`]);
    }
    const report = (i: number) =>
      app.request(`/api/memorials/M${i}/report`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.4' },
        body: JSON.stringify({ reason: 'rude' }),
      });
    for (let i = 0; i < 20; i++) expect((await report(i)).status).toBe(204);
    expect((await report(20)).status).toBe(429);
  });
});
