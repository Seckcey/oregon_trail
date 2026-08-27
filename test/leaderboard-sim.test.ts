// 4B in the sim: the claim flow and the leaderboard screen (docs/PHASE4-PLAN.md
// §1.3, §6, §7). Data in, data out — the UI posts and fetches, the sim renders.
import { describe, expect, test } from 'vitest';
import { COPY, createGame, reduce, view, type Action } from '../src/sim/game';
import { computeScore } from '../src/sim/score';
import { sceneOf } from '../src/sim/scene';
import type { GameState } from '../src/sim/types';
import { INPUT_MAX_LENGTH, inputAction } from '../src/ui/input';
import { arriveAt, departed, run } from './helpers';

const OFFLINE = 'The leaderboard is out of range here. Try again from a town with signal.';

function won(): GameState {
  const s = reduce(arriveAt(departed('claim-seed', 5, 'sysadmin'), 'sunset-cliffs'), { type: 'EVENT_CHOICE', index: 1 });
  if (s.phase !== 'victory') throw new Error(`expected victory, got ${s.phase}`);
  return s;
}
const ranked = (s: GameState) => reduce(s, { type: 'RUN_POSTED', rank: 37, total: 1204 });
const labels = (s: GameState) => view(s).choices.map((c) => `${c.key}) ${c.label}`);
const find = (s: GameState, re: RegExp): Action => {
  const c = view(s).choices.find((x) => re.test(x.label));
  if (!c) throw new Error(`no choice ${re} on ${view(s).title}`);
  return c.action;
};

describe('the way in', () => {
  test('the victory screen offers the board, and the title screen shows it', () => {
    const v = won();
    expect(labels(v)).toEqual(['1) Run it again', '2) Put your name on the board', '3) See the leaderboard']);
    expect(find(v, /Put your name/)).toEqual({ type: 'CLAIM_START' });
    expect(find(v, /See the leaderboard/)).toEqual({ type: 'OPEN', screen: 'leaderboard' });
    expect(find(createGame('x'), /leaderboard/i)).toEqual({ type: 'OPEN', screen: 'leaderboard' });
  });

  test('RUN_POSTED records the rank in any phase, harmlessly', () => {
    expect(ranked(won()).runRank).toEqual({ rank: 37, total: 1204 });
    expect(ranked(departed()).runRank).toEqual({ rank: 37, total: 1204 });
    expect(ranked(won()).phase).toBe('victory');
  });
});

describe('claim, screen 1 — the nickname', () => {
  test('says the score and the rank in the plan’s words, defaults the nickname to the first survivor, and can be skipped', () => {
    const s = reduce(ranked(won()), { type: 'CLAIM_START' });
    expect(s.phase).toBe('claim');
    expect(sceneOf(s).kind).toBe('menu');
    const screen = view(s);
    const score = computeScore(s.crew, s.supplies, s.cash, s.occupation!).total;
    expect(screen.title).toBe('THE 8 WEST LEADERBOARD');
    expect(screen.lines).toContain(`You made the cliffs with a score of ${score.toLocaleString('en-US')}. That’s good for #37 of 1,204 runs.`);
    expect(screen.lines).toContain('Put a nickname on the board? (2–16 letters; this is all anyone sees)');
    expect(screen.input).toEqual({ kind: 'name', prompt: 'Nickname', placeholder: s.crew.find((m) => m.alive)!.name });
    expect(labels(s)).toEqual(['0) Skip it']);
    expect(reduce(s, { type: 'CLAIM_SKIP' }).phase).toBe('victory');
  });

  test('without a rank (offline), it says so instead of inventing one', () => {
    const s = reduce(won(), { type: 'CLAIM_START' });
    expect(view(s).lines.join(' ')).toContain(OFFLINE);
    expect(view(s).lines.join(' ')).not.toContain('#');
  });

  test('a typed nickname is kept (trimmed, 16 max); an empty one keeps the default; then the email screen', () => {
    const s = reduce(ranked(won()), { type: 'CLAIM_START' });
    const typed = reduce(s, { type: 'SUBMIT_NAME', name: '  The Dane  ' });
    expect(typed.claim).toMatchObject({ step: 'email', name: 'The Dane' });
    const blank = reduce(s, { type: 'SUBMIT_NAME', name: '' });
    expect(blank.claim?.name).toBe(s.crew.find((m) => m.alive)!.name);
    expect(reduce(s, { type: 'SUBMIT_NAME', name: 'x'.repeat(30) }).claim?.name).toHaveLength(16);
    expect(reduce(s, { type: 'SUBMIT_NAME', name: 'x' }).claim?.name).toBe(s.crew.find((m) => m.alive)!.name); // too short: the default stands
  });
});

describe('claim, screen 2 — the email', () => {
  const atEmail = () => reduce(reduce(ranked(won()), { type: 'CLAIM_START' }), { type: 'SUBMIT_NAME', name: 'Dana' });

  test('asks in the plan’s words, with an email field and a way out', () => {
    const screen = view(atEmail());
    expect(screen.lines).toContain('Want 8 West IT to email you now and then — news about the company, the game, and what’s new on the road? Grown-ups only; if you’re under 18, skip this.');
    expect(screen.input).toEqual({ kind: 'email', prompt: 'Email (optional)', placeholder: '' });
    expect(labels(atEmail())).toEqual(['0) No thanks']);
    expect(INPUT_MAX_LENGTH.email).toBe(80);
    expect(inputAction('email', ' Dana@Example.com ', 0)).toEqual({ type: 'SUBMIT_EMAIL', email: ' Dana@Example.com ' });
  });

  test('No thanks or an empty email finishes the claim without an address', () => {
    expect(reduce(atEmail(), { type: 'CLAIM_SKIP' }).claim).toMatchObject({ step: 'done', email: null, consented: false });
    expect(reduce(atEmail(), { type: 'SUBMIT_EMAIL', email: '   ' }).claim).toMatchObject({ step: 'done', email: null, consented: false });
  });

  test('an email goes to the consent screen, trimmed', () => {
    const s = reduce(atEmail(), { type: 'SUBMIT_EMAIL', email: ' Dana@Example.com ' });
    expect(s.claim).toMatchObject({ step: 'consent', email: 'Dana@Example.com', consented: false });
  });
});

describe('claim, screen 3 — consent', () => {
  const atConsent = () => reduce(reduce(reduce(ranked(won()), { type: 'CLAIM_START' }), { type: 'SUBMIT_NAME', name: 'Dana' }), { type: 'SUBMIT_EMAIL', email: 'dana@example.com' });

  test('shows the sentence to tick and two ways to answer', () => {
    const screen = view(atConsent());
    expect(screen.lines).toContain('☐ I’m 18 or older, and I’d like occasional email from 8 West IT. I can unsubscribe with one click, any time.');
    expect(screen.input).toBeNull();
    expect(labels(atConsent())).toEqual(['1) That’s right, sign me up', '0) Actually, no']);
    expect(find(atConsent(), /sign me up/)).toEqual({ type: 'CLAIM_CONSENT' });
    expect(find(atConsent(), /Actually/)).toEqual({ type: 'CLAIM_SKIP' });
    expect(COPY.consent).toBe('I’m 18 or older, and I’d like occasional email from 8 West IT. I can unsubscribe with one click, any time.');
  });

  test('yes keeps the email and consents; no drops the email', () => {
    expect(reduce(atConsent(), { type: 'CLAIM_CONSENT' }).claim).toMatchObject({ step: 'done', email: 'dana@example.com', consented: true });
    expect(reduce(atConsent(), { type: 'CLAIM_SKIP' }).claim).toMatchObject({ step: 'done', email: null, consented: false });
  });
});

describe('claim, done', () => {
  const done = () => reduce(reduce(reduce(reduce(ranked(won()), { type: 'CLAIM_START' }), { type: 'SUBMIT_NAME', name: 'Dana' }), { type: 'SUBMIT_EMAIL', email: 'dana@example.com' }), { type: 'CLAIM_CONSENT' });

  test('says the rank; the unsubscribe link appears once the UI has it', () => {
    const s = done();
    expect(view(s).lines).toContain('You’re #37.');
    expect(view(s).lines.join(' ')).not.toContain('unsubscribe');
    const posted = reduce(s, { type: 'CLAIM_POSTED', unsubscribeUrl: 'https://8wt.8westit.com/unsubscribe/abc' });
    expect(view(posted).lines).toContain('Your unsubscribe link, if you ever want it: https://8wt.8westit.com/unsubscribe/abc');
    expect(view(posted).lines).toContain('(it’s saved on this device too)');
    expect(labels(posted)).toEqual(['1) See the leaderboard', '2) Run it again']);
  });

  test('the whole flow is a Screen like any other: BACK from the board returns here, RESTART works', () => {
    const board = reduce(done(), { type: 'OPEN', screen: 'leaderboard' });
    expect(board.phase).toBe('leaderboard');
    expect(reduce(board, { type: 'BACK' }).phase).toBe('claim');
    expect(reduce(done(), { type: 'RESTART' }).phase).toBe('title');
  });

  test('claim actions are ignored outside the claim phase', () => {
    const s = departed();
    for (const a of [{ type: 'CLAIM_SKIP' }, { type: 'CLAIM_CONSENT' }, { type: 'SUBMIT_EMAIL', email: 'x@y.com' }] as Action[]) {
      expect(reduce(structuredClone(s), a)).toEqual(s);
    }
    expect(reduce(structuredClone(s), { type: 'CLAIM_START' })).toEqual(s);
  });
});

describe('the leaderboard screen', () => {
  const board = {
    top: [
      { rank: 1, displayName: 'Dana', score: 3240, occupation: 'ceo' as const, days: 41, survivors: 5, summitRoute: 'grade' as const, celebration: 'swan' as const },
      { rank: 2, displayName: 'Wes', score: 3100, occupation: 'intern' as const, days: 50, survivors: 3, summitRoute: 'old80' as const, celebration: null },
    ],
    yours: { rank: 37, score: 1200, total: 1204 },
  };

  test('opening it marks the board loading; the UI’s answer renders the rows, the divider, and your own row', () => {
    const open = reduce(createGame('x'), { type: 'OPEN', screen: 'leaderboard' });
    expect(open.phase).toBe('leaderboard');
    expect(open.boardStatus).toBe('loading');
    expect(sceneOf(open).kind).toBe('menu');
    expect(view(open).lines.join(' ')).toContain('Checking the board');
    const loaded = reduce(open, { type: 'LEADERBOARD_LOADED', board });
    expect(loaded.boardStatus).toBe('ready');
    const lines = view(loaded).lines;
    expect(view(loaded).title).toBe('THE 8 WEST LEADERBOARD');
    expect(lines).toContain('#1 · Dana · 3,240 · CEO · 41 days · 5 made it · the 6% grade · swan dive');
    expect(lines).toContain('#2 · Wes · 3,100 · INTERN · 50 days · 3 made it · Old Highway 80');
    expect(lines).toContain('…');
    expect(lines).toContain('#37 · You · 1,200 · of 1,204 runs');
    expect(lines.at(-2)).toBe('Every run on this board got here on a 1985 van. Your business should be on something newer.');
    expect(lines.at(-1)).toBe('8 West IT 365 — alerts, tickets, time, and invoices in one connected workflow — 8westit.com/trail/');
    expect(labels(loaded)).toEqual(['0) Back']);
  });

  test('your row is not repeated when it is already in the top', () => {
    const s = reduce(reduce(createGame('x'), { type: 'OPEN', screen: 'leaderboard' }), { type: 'LEADERBOARD_LOADED', board: { ...board, yours: { rank: 1, score: 3240, total: 2 } } });
    const lines = view(s).lines;
    expect(lines).not.toContain('…');
    expect(lines.filter((l) => /^#1 ·/.test(l))).toHaveLength(1);
    expect(lines).toContain('#1 · Dana · 3,240 · CEO · 41 days · 5 made it · the 6% grade · swan dive — that’s you');
  });

  test('an empty board invites; a failed fetch says the plan’s offline line', () => {
    const open = reduce(createGame('x'), { type: 'OPEN', screen: 'leaderboard' });
    expect(view(reduce(open, { type: 'LEADERBOARD_LOADED', board: { top: [], yours: null } })).lines).toContain('Nobody has made the cliffs yet. Be the first.');
    const failed = reduce(open, { type: 'LEADERBOARD_LOADED', board: null });
    expect(failed.boardStatus).toBe('failed');
    expect(view(failed).lines).toContain(OFFLINE);
  });

  test('opening the board from the title returns to the title; from victory, to victory', () => {
    expect(reduce(reduce(createGame('x'), { type: 'OPEN', screen: 'leaderboard' }), { type: 'BACK' }).phase).toBe('title');
    expect(reduce(reduce(won(), { type: 'OPEN', screen: 'leaderboard' }), { type: 'BACK' }).phase).toBe('victory');
  });

  test('nothing here says the other game’s name', () => {
    const s = reduce(reduce(createGame('x'), { type: 'OPEN', screen: 'leaderboard' }), { type: 'LEADERBOARD_LOADED', board });
    const all = [...view(s).lines, ...Object.values(COPY).map((v) => (typeof v === 'function' ? v(1) : v))].join('\n');
    expect(all).not.toMatch(/oregon\s*trail/i);
    expect(run(createGame('x'))).toBeDefined();
  });
});
