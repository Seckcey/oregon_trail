// The UI layer's side effects, driven without a DOM: what main.ts does around
// the sim on boot, on progress, on death. Every dependency is a fake.
import { describe, expect, it } from 'vitest';
import { reduce, view } from '../src/sim/game';
import type { GameState, Memorial } from '../src/sim/types';
import { createSession, type SessionDeps } from '../src/ui/session';
import { departed } from './helpers';

function deps(over: Partial<SessionDeps> = {}) {
  const calls: Record<string, unknown[][]> = {
    fetchMemorials: [],
    postMemorial: [],
    addMemorials: [],
    storeSave: [],
    tagMemorial: [],
    track: [],
    reportMemorial: [],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec = (name: string, ret: unknown): any => (...args: unknown[]) => {
    calls[name]!.push(args);
    return ret;
  };
  const d: SessionDeps = {
    net: { base: '/api' },
    runIdFactory: () => 'run-uuid',
    loadSave: () => null,
    loadMemorials: () => [],
    storeSave: rec('storeSave', undefined),
    addMemorials: rec('addMemorials', undefined),
    tagMemorial: rec('tagMemorial', undefined),
    fetchMemorials: rec('fetchMemorials', Promise.resolve([{ id: 'R1', names: ['Dana'], mile: 5, day: 2, cause: 'THIRST', epitaph: 'REMOTE' }])),
    postMemorial: rec('postMemorial', Promise.resolve({ id: 'SRV', status: 'visible' })),
    reportMemorial: rec('reportMemorial', Promise.resolve(true)),
    turnstile: () => Promise.resolve('tok'),
    track: rec('track', undefined),
    ...over,
  };
  return { d, calls };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

/** A run that has just died: drive with no water, waving off notices and stops, until the epitaph screen. */
function dying(): GameState {
  let s = departed('session-death', 7, 'intern');
  s = { ...s, supplies: { ...s.supplies, water: 0, food: 0 }, cash: 0 };
  for (let i = 0; i < 400 && s.phase !== 'epitaph'; i++) {
    if (s.phase === 'event') s = reduce(s, s.pendingEvent?.choices ? { type: 'EVENT_CHOICE', index: 0 } : { type: 'EVENT_CONTINUE' });
    else if (s.phase === 'stop') s = reduce(s, { type: 'STOP_LEAVE' });
    else if (s.phase === 'travel') s = reduce(s, { type: 'DRIVE' });
    else if (s.phase === 'crossing') s = reduce(s, { type: 'CROSS', method: 'ford' });
    else throw new Error(`stuck on ${s.phase}`);
  }
  if (s.phase !== 'epitaph') throw new Error(`expected a death, got ${s.phase}`);
  return s;
}

describe('boot', () => {
  it('creates the game with the local memorials, then merges the remote sample in', async () => {
    const local: Memorial = { names: ['L'], mile: 50, day: 3, cause: 'HUNGER', epitaph: 'LOCAL' };
    const { d, calls } = deps({ loadMemorials: () => [local] });
    const session = createSession('seed-1', d);
    expect(session.state.memorials).toEqual([local]);
    await tick();
    expect(calls.fetchMemorials![0]).toEqual([{ base: '/api' }, 'seed-1']);
    expect(session.state.memorials.map((m) => m.epitaph)).toEqual(['REMOTE', 'LOCAL']);
    expect(session.state.phase).toBe('title');
  });
  it('offline: never fetches', async () => {
    const { d, calls } = deps({ net: { base: null } });
    createSession('seed-1', d);
    await tick();
    expect(calls.fetchMemorials).toHaveLength(0);
  });
  it('a fetch that fails leaves the local list alone', async () => {
    const { d } = deps({ fetchMemorials: () => Promise.resolve(null) });
    const session = createSession('seed-1', d);
    await tick();
    expect(session.state.memorials).toEqual([]);
  });
});

describe('progress', () => {
  it('saves the run with its id after every action once the road has started', () => {
    const { d, calls } = deps();
    const session = createSession('seed-1', d);
    session.state = departed('seed-1');
    session.dispatch({ type: 'DRIVE' });
    const last = calls.storeSave!.at(-1)![0] as { runId: string; state: GameState };
    expect(last.runId).toBe('run-uuid');
    expect(last.state).toBe(session.state);
    expect(last.state.day).toBeGreaterThan(0);
  });
  it('continues a saved run under its saved id', () => {
    const saved = departed('seed-2');
    const { d, calls } = deps({ loadSave: () => ({ runId: 'old-run', state: saved }) });
    const session = createSession('seed-1', d);
    expect(session.continueSave()).toBe(true);
    session.dispatch({ type: 'DRIVE' });
    expect((calls.storeSave!.at(-1)![0] as { runId: string }).runId).toBe('old-run');
  });
  it('a restart mints a new run id', () => {
    const ids = ['first', 'second'];
    const { d, calls } = deps({ runIdFactory: () => ids.shift() ?? 'more' });
    const session = createSession('seed-1', d);
    session.state = dying();
    session.dispatch({ type: 'SUBMIT_EPITAPH', text: 'x' });
    session.dispatch({ type: 'RESTART' });
    session.state = departed('seed-1');
    session.dispatch({ type: 'DRIVE' });
    expect((calls.storeSave!.at(-1)![0] as { runId: string }).runId).toBe('second');
  });
});

describe('reports', () => {
  it('a REPORT_MEMORIAL action posts the report with a token and tracks the outcome', async () => {
    const { d, calls } = deps();
    const session = createSession('seed-1', d);
    session.state = { ...departed('seed-1'), lastMemorial: { id: 'SRV1', names: ['A'], mile: 1, day: 1, cause: 'THIRST', epitaph: 'E' } };
    session.dispatch({ type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'spam' });
    await tick();
    expect(calls.reportMemorial![0]).toEqual([{ base: '/api' }, 'SRV1', 'spam', 'tok']);
    expect(calls.track!.some((c) => c[0] === 'memorial_reported')).toBe(true);
  });
  it('offline or blocked: the report is not sent', async () => {
    const { d, calls } = deps({ turnstile: () => Promise.resolve(null) });
    const session = createSession('seed-1', d);
    session.dispatch({ type: 'REPORT_MEMORIAL', id: 'SRV1', reason: 'spam' });
    await tick();
    expect(calls.reportMemorial).toHaveLength(0);
  });
});

describe('death', () => {
  it('stores the memorials locally, clears the save, posts once with the run id, and tags the local copy with the server id', async () => {
    const { d, calls } = deps();
    const session = createSession('seed-1', d);
    session.state = dying();
    session.dispatch({ type: 'SUBMIT_EPITAPH', text: 'we were so close' });
    expect(session.state.phase).toBe('dead');
    expect(calls.addMemorials).toHaveLength(1);
    expect(calls.storeSave!.at(-1)).toEqual([null]);
    await tick();
    expect(calls.postMemorial).toHaveLength(1);
    const [net, runId, memorial, token] = calls.postMemorial![0] as [unknown, string, Memorial, string];
    expect(net).toEqual({ base: '/api' });
    expect(runId).toBe('run-uuid');
    expect(memorial.epitaph).toBe('WE WERE SO CLOSE');
    expect(memorial.names).toHaveLength(5);
    expect(token).toBe('tok');
    expect(calls.tagMemorial![0]![1]).toBe('SRV');
    // The sim learns the post landed (A14 renders it).
    expect(session.state.memorialPosted).toEqual({ id: 'SRV', mile: memorial.mile });
    // A second action on the same death does not post again.
    session.dispatch({ type: 'BACK' });
    await tick();
    expect(calls.postMemorial).toHaveLength(1);
  });
  it('a hidden post is treated exactly like a visible one on the client, minus the sim line', async () => {
    const { d } = deps({ postMemorial: () => Promise.resolve({ id: 'H', status: 'hidden' }) });
    const session = createSession('seed-1', d);
    session.state = dying();
    session.dispatch({ type: 'SUBMIT_EPITAPH', text: 'x' });
    await tick();
    expect(session.state.memorialPosted).toBeNull();
  });
  it('offline: no post, everything else the same', async () => {
    const { d, calls } = deps({ net: { base: null } });
    const session = createSession('seed-1', d);
    session.state = dying();
    session.dispatch({ type: 'SUBMIT_EPITAPH', text: 'x' });
    await tick();
    expect(calls.postMemorial).toHaveLength(0);
    expect(calls.addMemorials).toHaveLength(1);
  });
  it('no Turnstile token (widget blocked): no post, no nagging', async () => {
    const { d, calls } = deps({ turnstile: () => Promise.resolve(null) });
    const session = createSession('seed-1', d);
    session.state = dying();
    session.dispatch({ type: 'SUBMIT_EPITAPH', text: 'x' });
    await tick();
    expect(calls.postMemorial).toHaveLength(0);
  });
  it('the sim is untouched by any of it: reduce is still pure', () => {
    const s = dying();
    const a = reduce(structuredClone(s), { type: 'SUBMIT_EPITAPH', text: 'x' });
    const b = reduce(structuredClone(s), { type: 'SUBMIT_EPITAPH', text: 'x' });
    expect(view(a)).toEqual(view(b));
  });
});
