import { describe, expect, it, vi } from 'vitest';
import { apiRequest, netConfig, type NetConfig } from '../src/ui/net/api';
import { fetchMemorials, postMemorial, reportMemorial } from '../src/ui/net/memorials';

type FetchLike = typeof fetch;
const ok = (body: unknown, status = 200): FetchLike => (async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })) as unknown as FetchLike;
const never: FetchLike = ((_: unknown, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))) as unknown as FetchLike;
const on: NetConfig = { base: '/api' };
const off: NetConfig = { base: null };

describe('netConfig: the switch', () => {
  it('is on when VITE_8WT_API is set and ?offline=1 is absent', () => {
    expect(netConfig({ VITE_8WT_API: '/api' }, '')).toEqual({ base: '/api' });
    expect(netConfig({ VITE_8WT_API: 'https://x.example/api/' }, '?seed=1')).toEqual({ base: 'https://x.example/api' });
  });
  it('is off with an empty base, an unset base, or ?offline=1', () => {
    expect(netConfig({ VITE_8WT_API: '' }, '')).toEqual({ base: null });
    expect(netConfig({}, '')).toEqual({ base: null });
    expect(netConfig({ VITE_8WT_API: '/api' }, '?offline=1')).toEqual({ base: null });
    expect(netConfig({ VITE_8WT_API: '/api' }, '?theme=comic&offline=1')).toEqual({ base: null });
  });
});

describe('apiRequest: every failure is null', () => {
  it('returns the parsed JSON on 2xx', async () => {
    expect(await apiRequest(on, '/memorials?seed=x', {}, ok([{ id: 'A' }]))).toEqual([{ id: 'A' }]);
  });
  it('returns {} on 204', async () => {
    const f = (async () => new Response(null, { status: 204 })) as unknown as FetchLike;
    expect(await apiRequest(on, '/x', { method: 'POST' }, f)).toEqual({});
  });
  it('500 → null, 4xx → null, network error → null, bad JSON → null', async () => {
    expect(await apiRequest(on, '/x', {}, ok({ error: 'boom' }, 500))).toBeNull();
    expect(await apiRequest(on, '/x', {}, ok({ error: 'no-contact' }, 422))).toBeNull();
    expect(await apiRequest(on, '/x', {}, (async () => { throw new TypeError('Failed to fetch'); }) as unknown as FetchLike)).toBeNull();
    expect(await apiRequest(on, '/x', {}, (async () => new Response('<html>', { status: 200 })) as unknown as FetchLike)).toBeNull();
  });
  it('times out at 3 seconds → null', async () => {
    vi.useFakeTimers();
    const p = apiRequest(on, '/x', {}, never);
    await vi.advanceTimersByTimeAsync(3001);
    expect(await p).toBeNull();
    vi.useRealTimers();
  });
  it('with the switch off it never calls fetch', async () => {
    const spy = vi.fn(ok([]));
    expect(await apiRequest(off, '/x', {}, spy as unknown as FetchLike)).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });
  it('sends JSON with the content type and the Turnstile token', async () => {
    const spy = vi.fn(ok({ id: 'A', status: 'visible' }, 201));
    await apiRequest(on, '/memorials', { method: 'POST', body: { a: 1 }, turnstile: 'tok' }, spy as unknown as FetchLike);
    const [url, init] = spy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/memorials');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('content-type')).toBe('application/json');
    expect(new Headers(init.headers).get('turnstile-token')).toBe('tok');
    expect(init.body).toBe('{"a":1}');
  });
});

describe('the memorial calls', () => {
  it('fetchMemorials keeps only well-formed rows and carries the id', async () => {
    const rows = [
      { id: 'A', names: ['Dana'], mile: 212, day: 14, cause: 'THIRST', epitaph: 'REST EASY' },
      { id: 'B', names: 'nope', mile: 1, day: 1, cause: 'X', epitaph: 'E' },
      { names: ['x'], mile: 1, day: 1, cause: 'X', epitaph: 'E' },
      'garbage',
    ];
    expect(await fetchMemorials(on, 'seed-1', ok(rows))).toEqual([{ id: 'A', names: ['Dana'], mile: 212, day: 14, cause: 'THIRST', epitaph: 'REST EASY' }]);
  });
  it('fetchMemorials passes the seed in the URL and is null when off or broken', async () => {
    const spy = vi.fn(ok([]));
    await fetchMemorials(on, 'a b', spy as unknown as FetchLike);
    expect((spy.mock.calls[0] as unknown as [string])[0]).toBe('/api/memorials?seed=a%20b');
    expect(await fetchMemorials(off, 'x', spy as unknown as FetchLike)).toBeNull();
    expect(await fetchMemorials(on, 'x', ok({ not: 'an array' }))).toBeNull();
  });
  it('postMemorial returns the id and status, or null', async () => {
    const memorial = { names: ['Dana'], mile: 212, day: 14, cause: 'THIRST', epitaph: 'REST EASY' };
    expect(await postMemorial(on, 'run-1', memorial, 'tok', ok({ id: 'A', status: 'hidden' }, 201))).toEqual({ id: 'A', status: 'hidden' });
    expect(await postMemorial(on, 'run-1', memorial, 'tok', ok({ error: 'no-contact' }, 422))).toBeNull();
    expect(await postMemorial(on, 'run-1', memorial, 'tok', ok({ weird: true }, 201))).toBeNull();
  });
  it('reportMemorial is true on 204', async () => {
    const f = (async () => new Response(null, { status: 204 })) as unknown as FetchLike;
    expect(await reportMemorial(on, 'A', 'rude', 'tok', f)).toBe(true);
    expect(await reportMemorial(on, 'A', 'rude', 'tok', ok({ error: 'x' }, 404))).toBe(false);
  });
});
