import { describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app.ts';
import { UNSUBSCRIBE_COPY } from '../src/unsubscribe.ts';

function lead(app: App, token: string, unsubscribedAt: string | null = null): void {
  app.db.run(
    `insert into leads (id, email, display_name, consent_text, consent_at, unsubscribe_token, unsubscribed_at) values (?, ?, 'D', 'c', '2026-08-01T00:00:00Z', ?, ?)`,
    [`L-${token}`, `${token}@example.com`, token, unsubscribedAt],
  );
}
const status = (app: App, token: string) => app.db.get<{ unsubscribed_at: string | null }>('select unsubscribed_at from leads where unsubscribe_token = ?', [token])?.unsubscribed_at ?? null;

describe('GET /unsubscribe/:token', () => {
  it('turns the lead off and shows the plan’s page, no confirmation step', async () => {
    const app = createApp({ dbPath: ':memory:' });
    lead(app, 'tok1');
    const res = await app.request('/unsubscribe/tok1');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    const html = await res.text();
    expect(html).toContain('You’re off the list.');
    expect(html).toContain(UNSUBSCRIBE_COPY.body);
    expect(html).toContain('privacy@8westit.com');
    expect(html).not.toMatch(/oregon\s*trail/i);
    expect(status(app, 'tok1')).toMatch(/^\d{4}-/);
  });

  it('is idempotent, and an unknown token gets the very same page (no oracle)', async () => {
    const app = createApp({ dbPath: ':memory:' });
    lead(app, 'tok1', '2026-08-02T00:00:00Z');
    const known = await (await app.request('/unsubscribe/tok1')).text();
    const unknown = await (await app.request('/unsubscribe/nope')).text();
    expect(known).toBe(unknown);
    expect(status(app, 'tok1')).toBe('2026-08-02T00:00:00Z');
  });

  it('never echoes the token or an address', async () => {
    const app = createApp({ dbPath: ':memory:' });
    lead(app, 'tok-secret');
    const html = await (await app.request('/unsubscribe/tok-secret')).text();
    expect(html).not.toContain('tok-secret');
    expect(html).not.toContain('@example.com');
  });

  it('is served under the same GET rate limit', async () => {
    const app = createApp({ dbPath: ':memory:' });
    for (let i = 0; i < 60; i++) await app.request('/unsubscribe/x', { headers: { 'x-forwarded-for': '10.0.0.8' } });
    expect((await app.request('/unsubscribe/x', { headers: { 'x-forwarded-for': '10.0.0.8' } })).status).toBe(429);
  });
});
