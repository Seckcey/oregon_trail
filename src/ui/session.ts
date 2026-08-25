// The session: one sim state, its run id, and every side effect the UI layer
// performs around the sim — saving, the roadside memorials in storage, the
// network calls, analytics. main.ts builds one with the real dependencies;
// test/session.test.ts drives one with fakes. Nothing in src/sim/ knows this
// file exists.

import { createGame, reduce, type Action, type ReportReason } from '../sim/game';
import { computeScore } from '../sim/score';
import type { Board, GameState, Memorial } from '../sim/types';
import type { NetConfig } from './net/api';
import type { RunPost, RunPosted } from './net/leaderboard';
import type { Posted } from './net/memorials';
import { mergeMemorials } from './net/merge';
import type { SaveEnvelope } from './persistence';

export type Outcome = 'run_died' | 'run_finished' | 'memorial_posted' | 'memorial_reported' | 'run_posted' | 'run_claimed';

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
  // 4B: the leaderboard
  playerToken: string;
  postRun: (net: NetConfig, run: RunPost, playerToken: string, token: string | null) => Promise<RunPosted | null>;
  fetchLeaderboard: (net: NetConfig, runId: string | null, playerToken: string) => Promise<Board | null>;
  storeUnsubscribeUrl: (url: string) => void;
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
      const wasClaiming = session.state.phase === 'claim';
      session.state = reduce(session.state, action);
      const s = session.state;
      if (action.type === 'REPORT_MEMORIAL') void sendReport(action.id, action.reason);
      // An ending is reached from the road — not from the claim or the board coming back to victory.
      const ended = s.phase === 'dead' || s.phase === 'victory';
      const afterEnding = prevPhase === 'dead' || prevPhase === 'victory' || prevPhase === 'claim' || prevPhase === 'leaderboard';
      if (ended && !afterEnding) {
        deps.addMemorials(s.runMemorials);
        deps.storeSave(null);
        deps.track(s.phase === 'dead' ? 'run_died' : 'run_finished', { mile: s.mile, day: s.day });
        if (s.phase === 'dead') void postDeath();
        if (s.phase === 'victory') void postVictory('victory');
      } else if (s.day > 0 && !s.gameOver) {
        deps.storeSave({ runId, state: s });
      }
      // The claim re-posts the same run: with the nickname, then with the email and consent.
      if (wasClaiming && s.phase === 'claim' && s.claim) {
        if (action.type === 'SUBMIT_NAME' && s.claim.step === 'email') void postVictory('name');
        if (action.type === 'CLAIM_CONSENT' && s.claim.consented) void postVictory('consent');
      }
      if (action.type === 'OPEN' && action.screen === 'leaderboard') void loadBoard();
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

  function runPost(s: GameState): RunPost | null {
    if (!s.occupation) return null;
    const survivors = s.crew.filter((m) => m.alive).map((m) => m.name);
    return {
      runId,
      score: computeScore(s.crew, s.supplies, s.cash, s.occupation).total,
      occupation: s.occupation,
      days: s.day,
      survivorNames: survivors,
      summitRoute: s.summitRoute,
      celebration: s.celebration,
      displayName: s.claim?.name ?? survivors[0] ?? 'Somebody',
      email: s.claim?.consented ? s.claim.email : null,
      consent: s.claim?.consented ?? false,
    };
  }

  /** Post (or re-post) the finished run; the rank and, after consent, the unsubscribe link come back into the sim. */
  async function postVictory(why: 'victory' | 'name' | 'consent'): Promise<void> {
    if (!deps.net.base) return;
    const body = runPost(session.state);
    if (!body) return;
    const myRun = runId;
    const token = await deps.turnstile();
    if (token === null) return;
    const result = await deps.postRun(deps.net, body, deps.playerToken, token || null);
    if (!result || runId !== myRun) return;
    session.dispatch({ type: 'RUN_POSTED', rank: result.rank, total: result.total });
    if (why === 'victory') deps.track('run_posted', { rank: result.rank });
    if (why === 'consent' && result.claimed && result.unsubscribeUrl) {
      deps.storeUnsubscribeUrl(result.unsubscribeUrl);
      deps.track('run_claimed');
      session.dispatch({ type: 'CLAIM_POSTED', unsubscribeUrl: result.unsubscribeUrl });
    }
  }

  async function loadBoard(): Promise<void> {
    if (!deps.net.base) {
      session.dispatch({ type: 'LEADERBOARD_LOADED', board: null });
      return;
    }
    const hasRun = session.state.day > 0 || session.state.gameOver;
    const board = await deps.fetchLeaderboard(deps.net, hasRun ? runId : null, deps.playerToken);
    if (session.state.phase === 'leaderboard') session.dispatch({ type: 'LEADERBOARD_LOADED', board });
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
