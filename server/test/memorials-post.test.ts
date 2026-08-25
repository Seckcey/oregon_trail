import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';

const RUN = '4c1d3f0a-2b7e-4c0d-9d6e-1f2a3b4c5d6e';
const body = { runId: RUN, mile: 212, day: 14, cause: 'THIRST', names: ['Dana', 'Wes'], epitaph: 'rest easy, dana' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;
async function post(app: App, payload: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return app.request('/api/memorials', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-player-token': 'tok', ...headers },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
}

describe('POST /api/memorials', () => {
  it('saves a clean memorial as visible and returns 201 with its id', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await post(app, body);
    expect(res.status).toBe(201);
    const json: Json = await res.json();
    expect(json.status).toBe('visible');
    expect(json.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/); // a ULID
    const row = app.db.get<{ epitaph: string; names: string; status: string }>('select epitaph, names, status from memorials where run_id = ?', [RUN]);
    expect(row).toEqual({ epitaph: 'REST EASY, DANA', names: '["Dana","Wes"]', status: 'visible' });
  });

  it('saves a filter hit as hidden and still answers 201 (the player cannot tell)', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await post(app, { ...body, epitaph: 'SH1T HAPPENS' });
    expect(res.status).toBe(201);
    expect(((await res.json()) as Json).status).toBe('hidden');
    const row = app.db.get<{ status: string; hide_reason: string }>('select status, hide_reason from memorials where run_id = ?', [RUN]);
    expect(row).toEqual({ status: 'hidden', hide_reason: 'filter' });
  });

  it('filters names too: a rude crew name hides the memorial', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await post(app, { ...body, names: ['Dana', 'a s s'] });
    expect(((await res.json()) as Json).status).toBe('hidden');
  });

  it('is idempotent on runId: a second post updates the row, never duplicates', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const first: Json = await (await post(app, body)).json();
    const second: Json = await (await post(app, { ...body, epitaph: 'SECOND THOUGHTS' })).json();
    expect(second.id).toBe(first.id);
    expect(app.db.all('select id from memorials')).toHaveLength(1);
    expect(app.db.get<{ epitaph: string }>('select epitaph from memorials')?.epitaph).toBe('SECOND THOUGHTS');
  });

  it('rejects contact info with the one message the player sees', async () => {
    const app = createApp({ dbPath: ':memory:' });
    const res = await post(app, { ...body, epitaph: 'CALL 555-123-4567' });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: 'no-contact' });
    expect(app.db.all('select id from memorials')).toHaveLength(0);
  });

  it('rejects a bad body with 400 and the reason', async () => {
    const app = createApp({ dbPath: ':memory:' });
    expect((await post(app, { ...body, cause: 'DIABETES' })).status).toBe(400);
    expect(await (await post(app, { ...body, mile: 999 })).json()).toEqual({ error: 'bad-mile' });
  });

  it('rejects malformed JSON with 400', async () => {
    const app = createApp({ dbPath: ':memory:' });
    expect((await post(app, '{not json')).status).toBe(400);
  });

  it('rejects the wrong content type with 415', async () => {
    const app = createApp({ dbPath: ':memory:' });
    expect((await post(app, body, { 'content-type': 'text/plain' })).status).toBe(415);
  });

  it('rejects a body over 4 KB with 413', async () => {
    const app = createApp({ dbPath: ':memory:' });
    expect((await post(app, { ...body, epitaph: 'x'.repeat(5000) })).status).toBe(413);
  });

  it('an empty epitaph falls back to the default line', async () => {
    const app = createApp({ dbPath: ':memory:' });
    await post(app, { ...body, epitaph: '' });
    expect(app.db.get<{ epitaph: string }>('select epitaph from memorials')?.epitaph).toBe('THE BEACH WAS THAT WAY.');
  });
});
