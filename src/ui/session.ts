// The session: one sim state, its run id, and every side effect the UI layer
// performs around the sim — saving, the roadside memorials in storage, the
// network calls, analytics. main.ts builds one with the real dependencies;
// test/session.test.ts drives one with fakes. Nothing in src/sim/ knows this
// file exists.

import { createGame, reduce, type Action, type ReportReason } from '../sim/game';
import type { GameState, Memorial } from '../sim/types';
import type { NetConfig } from './net/api';
import type { Posted } from './net/memorials';
import { mergeMemorials } from './net/merge';
import type { SaveEnvelope } from './persistence';

export type Outcome = 'run_died' | 'run_finished' | 'memorial_posted' | 'memorial_reported';

export interface SessionDeps {
  net: NetConfig;
  runIdFactory: () => string;
  loadSave: () => SaveEnvelope | null;
  loadMemorials: () => Memorial[];
  storeSave: (env: SaveEnvelope | null) => void;
  addMemorials: (memorials: Memorial[]) => void;
  tagMemorial: (memorial: Memorial, id: string) => void;
  fetchMemorials: (net: NetConfig, seed: string) => Promise<Memorial[] | null>;
  postMemorial: (net: NetConfig, runId: string, memorial: Memorial, token: string | null) => Promise<Posted | null>;
  reportMemorial: (net: NetConfig, id: string, reason: ReportReason, token: string | null) => Promise<boolean>;
  /** A Turnstile token for one POST; '' when the build has no widget (post anyway); null when blocked (do not post). */
  turnstile: () => Promise<string | null>;
  /** Analytics outcomes only — never a name, an epitaph, or an email. */
  track: (outcome: Outcome, params?: Record<string, string | number>) => void;
}

export interface Session {
  state: GameState;
  readonly runId: string;
  dispatch(action: Action): void;
  /** Resume the saved run, if there is one worth resuming. */
  continueSave(): boolean;
  /** Called after every state change; the renderer hooks in here. */
  onChange: () => void;
}

export function createSession(seed: string, deps: SessionDeps): Session {
  let runId = deps.runIdFactory();
  let posted = false;

  const session: Session = {
    state: createGame(seed, deps.loadMemorials()),
    get runId() {
      return runId;
    },
    onChange: () => {},
    dispatch(action: Action): void {
      const prevPhase = session.state.phase;
      if (action.type === 'RESTART') {
        runId = deps.runIdFactory();
        posted = false;
      }
      session.state = reduce(session.state, action);
      const s = session.state;
      if (action.type === 'REPORT_MEMORIAL') void sendReport(action.id, action.reason);
      const ended = s.phase === 'dead' || s.phase === 'victory';
      if (ended && prevPhase !== s.phase) {
        deps.addMemorials(s.runMemorials);
        deps.storeSave(null);
        deps.track(s.phase === 'dead' ? 'run_died' : 'run_finished', { mile: s.mile, day: s.day });
        if (s.phase === 'dead') void postDeath();
      } else if (s.day > 0 && !s.gameOver) {
        deps.storeSave({ runId, state: s });
      }
      session.onChange();
    },
    continueSave(): boolean {
      const save = deps.loadSave();
      if (!save || save.state.gameOver) return false;
      session.state = save.state;
      runId = save.runId;
      posted = false;
      session.onChange();
      return true;
    },
  };

  async function postDeath(): Promise<void> {
    if (posted || !deps.net.base) return;
    posted = true;
    const grave = session.state.runMemorials.at(-1);
    if (!grave) return;
    const myRun = runId;
    const token = await deps.turnstile();
    if (token === null) return;
    const result = await deps.postMemorial(deps.net, myRun, grave, token || null);
    if (!result) return;
    deps.tagMemorial(grave, result.id);
    deps.track('memorial_posted', { status: result.status });
    if (result.status === 'visible' && runId === myRun) {
      session.dispatch({ type: 'MEMORIAL_POSTED', id: result.id, mile: grave.mile });
    }
  }

  async function sendReport(id: string, reason: ReportReason): Promise<void> {
    if (!deps.net.base) return;
    const token = await deps.turnstile();
    if (token === null) return;
    const ok = await deps.reportMemorial(deps.net, id, reason, token || null);
    if (ok) deps.track('memorial_reported', { reason });
  }

  // Boot: the road's memorials from the API, merged over the local ones.
  if (deps.net.base) {
    void deps.fetchMemorials(deps.net, seed).then((remote) => {
      if (!remote) return;
      session.dispatch({ type: 'MEMORIALS_LOADED', memorials: mergeMemorials(session.state.memorials, remote) });
    });
  }

  return session;
}
