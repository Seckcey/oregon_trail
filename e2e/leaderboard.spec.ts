// Phase 4B in a real browser, against the production build, with /api/**
// intercepted: victory posts the run and the claim walks nickname → email →
// consent → rank; victory → skip posts nothing more; the title screen opens
// the board from a mocked list.

import { expect, test, type Page } from '@playwright/test';
import { reduce } from '../src/sim/game';
import type { GameState } from '../src/sim/types';
import { arriveAt, departed } from '../test/helpers';

const BOARD = {
  top: [
    { rank: 1, displayName: 'Dana', score: 3240, occupation: 'ceo', days: 41, survivors: 5, summitRoute: 'grade', celebration: 'swan' },
    { rank: 2, displayName: 'Wes', score: 3100, occupation: 'intern', days: 50, survivors: 3, summitRoute: 'old80', celebration: null },
  ],
  yours: null,
};

interface ApiLog {
  gets: string[];
  posts: { url: string; body: Record<string, unknown>; playerToken: string | null }[];
}

async function mockApi(page: Page): Promise<ApiLog> {
  const log: ApiLog = { gets: [], posts: [] };
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() === 'GET') {
      log.gets.push(url.pathname + url.search);
      const body = url.pathname.endsWith('/leaderboard') ? { ...BOARD, yours: url.search.includes('run=') ? { rank: 37, score: 1200, total: 1204 } : null } : [];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      return;
    }
    const body = req.postDataJSON() as Record<string, unknown>;
    log.posts.push({ url: url.pathname, body, playerToken: req.headers()['x-player-token'] ?? null });
    const claimed = body['consent'] === true && typeof body['email'] === 'string';
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'SRV-RUN', rank: 37, total: 1204, claimed, ...(claimed ? { unsubscribeUrl: 'https://8wt.8westit.com/unsubscribe/e2e-token' } : {}) }),
    });
  });
  return log;
}

/** One balloon from the cliffs: the crew is on the sandstone, the jump is next. */
function atCliffs(seed: string): GameState {
  return arriveAt(departed(seed, 5, 'sysadmin'), 'sunset-cliffs');
}

async function resume(page: Page, theme: string, state: GameState, runId: string): Promise<void> {
  await page.goto(`/?theme=${theme}`);
  await page.evaluate(([s, id]) => localStorage.setItem('8wt.save.v3', JSON.stringify({ runId: id, state: s })), [state, runId] as [GameState, string]);
  await page.reload();
  await page.getByRole('button', { name: 'Continue the last run' }).click();
}

for (const theme of ['comic', 'heritage'] as const) {
  test.describe(`the leaderboard (${theme})`, () => {
    test('victory posts the run; the claim walks nickname → email → consent and shows the rank and the unsubscribe link', async ({ page }) => {
      const api = await mockApi(page);
      await resume(page, theme, atCliffs('e2e-claim'), 'e2e-run-claim');
      await page.keyboard.press('2'); // swan dive
      await expect(page.locator('#app')).toContainText('SUNSET CLIFFS');
      await expect.poll(() => api.posts.length).toBe(1);
      expect(api.posts[0]!.url).toBe('/api/runs');
      expect(api.posts[0]!.body).toMatchObject({ runId: 'e2e-run-claim', occupation: 'sysadmin', celebration: 'swan', email: null, consent: false });
      expect(api.posts[0]!.playerToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
      await expect(page.getByRole('menuitem', { name: /Put your name on the board/ })).toBeVisible();
      await page.keyboard.press('2');
      await expect(page.locator('#app')).toContainText(/You made the cliffs with a score of [\d,]+\. That’s good for #37 of 1,204 runs\./);
      await page.locator('#comic-input, #input-field').focus();
      await page.keyboard.type('The Dane');
      await page.keyboard.press('Enter');
      await expect.poll(() => api.posts.length).toBe(2);
      expect(api.posts[1]!.body).toMatchObject({ displayName: 'The Dane', email: null, consent: false });
      await expect(page.locator('#app')).toContainText('Grown-ups only; if you’re under 18, skip this.');
      const field = page.locator('#comic-input, #input-field');
      await expect(field).toHaveAttribute('type', 'email');
      await field.focus();
      await page.keyboard.type('dana@example.com');
      await page.keyboard.press('Enter');
      await expect(page.locator('#app')).toContainText('I’m 18 or older, and I’d like occasional email from 8 West IT.');
      await page.keyboard.press('1'); // That’s right, sign me up
      await expect.poll(() => api.posts.length).toBe(3);
      expect(api.posts[2]!.body).toMatchObject({ displayName: 'The Dane', email: 'dana@example.com', consent: true });
      await expect(page.locator('#app')).toContainText('You’re #37.');
      await expect(page.locator('#app')).toContainText('Your unsubscribe link, if you ever want it: https://8wt.8westit.com/unsubscribe/e2e-token');
      expect(await page.evaluate(() => localStorage.getItem('8wt.unsubscribe.v1'))).toBe('https://8wt.8westit.com/unsubscribe/e2e-token');
      // And on to the board, which knows where we landed.
      await page.keyboard.press('1');
      await expect(page.locator('#app')).toContainText('#1 · Dana · 3,240 · CEO · 41 days · 5 made it · the 6% grade · swan dive');
      await expect(page.locator('#app')).toContainText('#37 · You · 1,200 · of 1,204 runs');
      expect(api.gets.some((g) => g === '/api/leaderboard?run=e2e-run-claim')).toBe(true);
    });

    test('victory → skip posts nothing more', async ({ page }) => {
      const api = await mockApi(page);
      await resume(page, theme, atCliffs('e2e-skip'), 'e2e-run-skip');
      await page.keyboard.press('1'); // cannonball
      await expect.poll(() => api.posts.length).toBe(1);
      await page.keyboard.press('2');
      await expect(page.locator('#app')).toContainText('Put a nickname on the board?');
      await page.getByRole('menuitem', { name: /Skip it/ }).click(); // the field has focus; the sign is the way out
      await expect(page.locator('#app')).toContainText('SUNSET CLIFFS');
      await page.waitForTimeout(300);
      expect(api.posts).toHaveLength(1);
    });
  });
}

test.describe('the board from the title', () => {
  test('title → leaderboard → the mocked list, with the CTA and a way back', async ({ page }) => {
    const api = await mockApi(page);
    await page.goto('/?theme=comic&seed=e2e-board');
    await page.keyboard.press('4');
    await expect(page.locator('#app')).toContainText('THE 8 WEST LEADERBOARD');
    await expect(page.locator('#app')).toContainText('#2 · Wes · 3,100 · INTERN · 50 days · 3 made it · Old Highway 80');
    await expect(page.locator('#app')).toContainText('Every run on this board got here on a 1985 van.');
    expect(api.gets).toContain('/api/leaderboard');
    await expect(page.getByRole('button', { name: /8westit\.com/ })).toBeVisible();
    await page.keyboard.press('0');
    await expect(page.locator('.mast-title, #screen-title').first()).toContainText('THE 8 WEST TRAIL');
  });

  test('offline, the board says it is out of range and the game goes on', async ({ page }) => {
    const calls: string[] = [];
    await page.route('**/api/**', (route) => {
      calls.push(route.request().url());
      return route.abort();
    });
    await page.goto('/?theme=heritage&offline=1');
    await page.keyboard.press('4');
    await expect(page.locator('#app')).toContainText('The leaderboard is out of range here. Try again from a town with signal.');
    await page.keyboard.press('0');
    await page.keyboard.press('1');
    await expect(page.locator('#app')).toContainText(/CEO|sysadmin|intern/i);
    expect(calls).toEqual([]);
  });
});

// Keep the sim import honest: the fixture above is the real sim one step before the jump.
void reduce;
