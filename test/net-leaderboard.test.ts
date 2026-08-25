import { describe, expect, it, vi } from 'vitest';
import type { NetConfig } from '../src/ui/net/api';
import { fetchLeaderboard, postRun, type RunPost } from '../src/ui/net/leaderboard';

type FetchLike = typeof fetch;
const ok = (body: unknown, status = 200): FetchLike => (async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })) as unknown as FetchLike;
const on: NetConfig = { base: '/api' };
const off: NetConfig = { base: null };
const run: RunPost = { runId: 'r1', score: 1200, occupation: 'sysadmin', days: 41, survivorNames: ['Dana'], summitRoute: 'grade', celebration: 'swan', displayName: 'Dana', email: null, consent: false };

describe('postRun', () => {
  it('posts the run with the player token and the Turnstile token, and returns rank/total/claimed/unsubscribeUrl', async () => {
    const spy = vi.fn(ok({ id: 'X', rank: 37, total: 1204, claimed: true, unsubscribeUrl: 'https://8wt.8westit.com/unsubscribe/abc' }, 201));
    const res = await postRun(on, { ...run, email: 'dana@example.com', consent: true }, 'player-tok', 'ts-tok', spy as unknown as FetchLike);
    expect(res).toEqual({ rank: 37, total: 1204, claimed: true, unsubscribeUrl: 'https://8wt.8westit.com/unsubscribe/abc' });
    const [url, init] = spy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/runs');
    const headers = new Headers(init.headers);
    expect(headers.get('x-player-token')).toBe('player-tok');
    expect(headers.get('turnstile-token')).toBe('ts-tok');
    expect(JSON.parse(String(init.body))).toEqual({ ...run, email: 'dana@example.com', consent: true });
  });
  it('null when off, when the server refuses, or when the answer is malformed', async () => {
    expect(await postRun(off, run, 'p', 't', ok({ rank: 1, total: 1 }, 201))).toBeNull();
    expect(await postRun(on, run, 'p', 't', ok({ error: 'bad-score' }, 400))).toBeNull();
    expect(await postRun(on, run, 'p', 't', ok({ id: 'X' }, 201))).toBeNull();
  });
  it('unsubscribeUrl is null when not claimed', async () => {
    expect(await postRun(on, run, 'p', null, ok({ id: 'X', rank: 2, total: 9, claimed: false }, 201))).toEqual({ rank: 2, total: 9, claimed: false, unsubscribeUrl: null });
  });
});

describe('fetchLeaderboard', () => {
  const board = { top: [{ rank: 1, displayName: 'Dana', score: 3240, occupation: 'ceo', days: 41, survivors: 5, summitRoute: 'grade', celebration: 'swan' }], yours: null };
  it('asks with the run id and the player token, and returns the board', async () => {
    const spy = vi.fn(ok(board));
    expect(await fetchLeaderboard(on, 'r1', 'player-tok', spy as unknown as FetchLike)).toEqual(board);
    const [url, init] = spy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/leaderboard?run=r1');
    expect(new Headers(init.headers).get('x-player-token')).toBe('player-tok');
  });
  it('asks without a run when there is none (the title screen)', async () => {
    const spy = vi.fn(ok(board));
    await fetchLeaderboard(on, null, 'player-tok', spy as unknown as FetchLike);
    expect((spy.mock.calls[0] as unknown as [string])[0]).toBe('/api/leaderboard');
  });
  it('drops malformed rows and is null when off or broken', async () => {
    const dirty = { top: [board.top[0], { rank: 'x' }, 'junk'], yours: { rank: 3, score: 100, total: 5 } };
    expect(await fetchLeaderboard(on, null, 'p', ok(dirty))).toEqual({ top: board.top, yours: { rank: 3, score: 100, total: 5 } });
    expect(await fetchLeaderboard(off, null, 'p', ok(board))).toBeNull();
    expect(await fetchLeaderboard(on, null, 'p', ok({ nope: 1 }))).toBeNull();
    expect(await fetchLeaderboard(on, null, 'p', ok({ top: [], yours: 'bad' }))).toEqual({ top: [], yours: null });
  });
});
