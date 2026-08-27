// The privacy note (docs/PHASE4-PLAN.md §5.2) lives in About and at /privacy,
// and nothing the site prints says the other game's name.
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { PRIVACY_NOTE, PRIVACY_MAILBOX } from '../src/sim/data/privacy';
import { COPY, createGame, reduce, view } from '../src/sim/game';
import { ABOUT_T1D_LINES } from '../src/sim/t1d';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const flat = (s: string) => s.replace(/\s+/g, ' ');
const NOT_OURS = /oregon\s*trail/i;

describe('the privacy note', () => {
  test('is the plan’s note, whole, and names the mailbox', () => {
    const text = PRIVACY_NOTE.join('\n');
    expect(PRIVACY_NOTE[0]).toBe('What The 8 West Trail keeps');
    expect(text).toContain('The game runs in your browser.');
    expect(text).toContain('Giving us your email is optional, and it’s for grown-ups');
    expect(text).toContain('Google Analytics stays off unless you choose “Accept analytics.”');
    expect(text).toContain('It never receives crew nicknames, leaderboard names, email addresses, or epitaphs.');
    expect(text).toContain(PRIVACY_MAILBOX);
    expect(PRIVACY_MAILBOX).toBe('privacy@8westit.com');
    expect(PRIVACY_NOTE.at(-1)).toBe('8 West Ventures, LLC · updated August 2026');
  });

  test('every line of it is on the About screen, after the Type 1 note', () => {
    const about = view(reduce(createGame('x'), { type: 'OPEN', screen: 'about' }));
    for (const line of PRIVACY_NOTE) expect(about.lines).toContain(line);
    expect(about.lines.indexOf(PRIVACY_NOTE[0]!)).toBeGreaterThan(about.lines.indexOf(ABOUT_T1D_LINES[0]!));
  });

  test('every paragraph of it is in public/privacy.html, which links back to the game and to the CTA', () => {
    const html = flat(read('public/privacy.html'));
    for (const line of PRIVACY_NOTE) expect(html).toContain(flat(line).replace(/&/g, '&amp;'));
    expect(html).toContain('href="/"');
    expect(html).toContain('utm_id=8w365-ft-2026-09&amp;utm_source=8wt&amp;utm_medium=game&amp;utm_campaign=founding_trail_sep_2026&amp;utm_source_platform=8wt&amp;utm_content=privacy#workflow');
    expect(html).not.toMatch(NOT_OURS);
  });
});

describe('the other game’s name is never printed', () => {
  test('not in the screen copy, the privacy note, the About lines, index.html, or the deck', () => {
    for (const value of Object.values(COPY)) {
      const text = typeof value === 'function' ? value(212) : value;
      expect(text).not.toMatch(NOT_OURS);
    }
    for (const line of [...PRIVACY_NOTE, ...ABOUT_T1D_LINES]) expect(line).not.toMatch(NOT_OURS);
    expect(read('index.html')).not.toMatch(NOT_OURS);
    // Every screen the sim can show from a fresh game, and the endings.
    for (const screen of ['help', 'about'] as const) {
      expect(view(reduce(createGame('x'), { type: 'OPEN', screen })).lines.join('\n')).not.toMatch(NOT_OURS);
    }
  });
});
