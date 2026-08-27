// Phase 4A in a real browser, against the production build, with /api/**
// intercepted: the road shows a stranger's memorial from a mocked GET, a
// report posts once, a death posts once with the run's id, and ?offline=1
// makes no network call at all.

import { expect, test, type Page, type Route } from '@playwright/test';
import type { GameState } from '../src/sim/types';
import { departed } from '../test/helpers';

const STRANGER = { id: 'SRV-STRANGER', names: ['Dot', 'Wes'], mile: 12, day: 2, cause: 'HEATSTROKE', epitaph: 'SHOULD HAVE BOUGHT THE HOSE' };

interface ApiLog {
  gets: string[];
  posts: { url: string; body: unknown }[];
}

/** Mock the API: the sample carries one stranger; every POST is a 201/204. */
async function mockApi(page: Page): Promise<ApiLog> {
  const log: ApiLog = { gets: [], posts: [] };
  await page.route('**/api/**', async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() === 'GET') {
      log.gets.push(url.pathname + url.search);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([STRANGER]) });
      return;
    }
    log.posts.push({ url: url.pathname, body: req.postDataJSON() });
    if (/\/report$/.test(url.pathname)) await route.fulfill({ status: 204 });
    else await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'SRV-MINE', status: 'visible' }) });
  });
  return log;
}

async function outfit(page: Page): Promise<void> {
  await page.keyboard.press('1');
  await page.keyboard.press('1');
  await page.keyboard.press('3');
  for (let i = 0; i < 5; i++) {
    await page.locator('#comic-input, #input-field').focus();
    await page.keyboard.press('Enter');
  }
  for (let i = 0; i < 8; i++) await page.keyboard.press('3');
  for (let i = 0; i < 4; i++) await page.keyboard.press('2');
  for (let i = 0; i < 8; i++) await page.keyboard.press('1');
  await page.keyboard.press('0');
}

/** A crew one drive from the end: everyone at 1 health, no water. */
function doomed(seed: string): GameState {
  const s = structuredClone(departed(seed, 6, 'ceo'));
  for (const m of s.crew) m.health = 1;
  s.supplies.water = 0;
  return s;
}

for (const theme of ['comic', 'heritage'] as const) {
  test.describe(`the trail remembers (${theme})`, () => {
    test('a stranger’s memorial from the API stands on the road, and reporting it posts once', async ({ page }) => {
      const api = await mockApi(page);
      await page.goto(`/?theme=${theme}&seed=e2e-memorial`);
      await expect.poll(() => api.gets.length).toBe(1);
      expect(api.gets[0]).toBe('/api/memorials?seed=e2e-memorial');
      await outfit(page);
      // Drive until the stranger at mile 12 has been passed: the day it happens, the road
      // offers to report it (an event may fire the same day; pressing 1 waves it off).
      const report = page.getByRole('menuitem', { name: /Report that memorial/ });
      for (let i = 0; i < 8 && (await report.count()) === 0; i++) {
        await page.keyboard.press('1');
        await page.waitForTimeout(150);
      }
      await expect(report).toBeVisible();
      await page.keyboard.press('8');
      await expect(page.locator('#app')).toContainText('Why should this come down?');
      await expect(page.locator('#app')).toContainText('SHOULD HAVE BOUGHT THE HOSE');
      await page.keyboard.press('3'); // Spam
      await expect.poll(() => api.posts.length).toBe(1);
      expect(api.posts[0]).toEqual({ url: '/api/memorials/SRV-STRANGER/report', body: { reason: 'spam' } });
      await expect(page.locator('#app')).toContainText('Thanks. We’ll take a look.');
      await expect(page.getByRole('menuitem', { name: /Report that memorial/ })).toHaveCount(0);
    });

    test('a death posts the memorial once, with the run id, and the dead screen says where it stands', async ({ page }) => {
      const api = await mockApi(page);
      await page.goto(`/?theme=${theme}`);
      await page.evaluate((state: GameState) => localStorage.setItem('8wt.save.v3', JSON.stringify({ runId: 'e2e-run-id', state })), doomed('e2e-doom'));
      await page.reload();
      await page.getByRole('menuitem', { name: 'Continue the last run' }).click();
      await page.keyboard.press('1'); // Drive on — and that is that
      await expect(page.locator('#app')).toContainText('THE ROAD HAS TAKEN EVERYONE');
      await expect(page.locator('#app')).toContainText('Other crews will read this.');
      await page.locator('#comic-input, #input-field').focus();
      await page.keyboard.type('WE WERE SO CLOSE');
      await page.keyboard.press('Enter');
      await expect(page.locator('#app')).toContainText('HERE ENDS THE RUN');
      await expect.poll(() => api.posts.length).toBe(1);
      const post = api.posts[0]!;
      expect(post.url).toBe('/api/memorials');
      expect(post.body).toMatchObject({ runId: 'e2e-run-id', cause: 'THIRST', epitaph: 'WE WERE SO CLOSE' });
      expect((post.body as { names: string[] }).names).toHaveLength(5);
      await expect(page.locator('#app')).toContainText(/Your memorial stands at mile \d+\. The next crew through will pass it\./);
      await expect(page.locator('#app')).toContainText('Presented by 8 West IT 365');
      // Sitting on the screen, toggling themes, nothing posts twice.
      await page.locator('.mast-theme, #theme-toggle').first().click().catch(() => {});
      await page.waitForTimeout(300);
      expect(api.posts).toHaveLength(1);
    });
  });
}

test.describe('the switch', () => {
  test('?offline=1 makes no API call at all, on the road or at the grave', async ({ page }) => {
    const calls: string[] = [];
    await page.route('**/api/**', async (route) => {
      calls.push(route.request().url());
      await route.abort();
    });
    await page.goto('/?theme=comic&offline=1');
    await page.evaluate((state: GameState) => localStorage.setItem('8wt.save.v3', JSON.stringify({ runId: 'e2e-offline', state })), doomed('e2e-offline'));
    await page.reload();
    await page.getByRole('menuitem', { name: 'Continue the last run' }).click();
    await page.keyboard.press('1');
    await expect(page.locator('#app')).toContainText('THE ROAD HAS TAKEN EVERYONE');
    await page.locator('#comic-input').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#app')).toContainText('HERE ENDS THE RUN');
    await expect(page.locator('#app')).toContainText('The memorial will stand by the road for the next crew to pass.');
    await page.waitForTimeout(300);
    expect(calls).toEqual([]);
  });

  test('the API down (every call fails) is the same game, silently', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort('connectionrefused'));
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/?theme=heritage');
    await page.evaluate((state: GameState) => localStorage.setItem('8wt.save.v3', JSON.stringify({ runId: 'e2e-down', state })), doomed('e2e-down'));
    await page.reload();
    await page.getByRole('menuitem', { name: 'Continue the last run' }).click();
    await page.keyboard.press('1');
    await expect(page.locator('#app')).toContainText('THE ROAD HAS TAKEN EVERYONE');
    await page.locator('#input-field').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#app')).toContainText('The memorial will stand by the road for the next crew to pass.');
    expect(errors).toEqual([]);
  });

  test('/privacy is served and says what the game keeps', async ({ page }) => {
    await page.goto('/privacy.html');
    await expect(page.locator('h1')).toHaveText('What The 8 West Trail keeps');
    await expect(page.locator('body')).toContainText('privacy@8westit.com');
  });
});
