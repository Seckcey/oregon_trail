// The playthrough: a real browser plays the game in both themes against the
// production build, from the outfitter to the end of the road, with the same
// keys a player would press. Run with `npm run e2e` (builds first).

import { expect, test, type Page } from '@playwright/test';
import { reduce } from '../src/sim/game';
import { computeScore } from '../src/sim/score';
import type { GameState } from '../src/sim/types';
import { arriveAt, departed } from '../test/helpers';

/** What the screen offers right now, the same in either theme. */
interface Offer {
  title: string;
  body: string;
  labels: string[];
  keys: string[];
  hasInput: boolean;
}

async function offer(page: Page): Promise<Offer> {
  return page.evaluate(() => {
    // Heritage letters its lines with a typewriter; a click reveals them all at once.
    document.querySelector<HTMLElement>('#screen-lines')?.click();
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('button[data-key], #screen-choices button[role="menuitem"]')];
    const labels = buttons.map((b) => (b.querySelector('.words')?.textContent ?? b.textContent ?? '').replace(/^\s*\d+\)?\s*/, '').trim());
    const keys = buttons.map((b) => b.dataset['key'] ?? (b.querySelector('.key')?.textContent ?? '').replace(/\)/, '').trim());
    return {
      title: (document.querySelector('.title-caption') ?? document.querySelector('#screen-title'))?.textContent?.trim() ?? '',
      body: document.querySelector('#app')?.textContent ?? '',
      labels,
      keys,
      hasInput: !!document.querySelector('#comic-input, #input-field:not([hidden])') && !document.querySelector('#screen-input[hidden]'),
    };
  });
}

/** What the driver keeps in mind between screens. */
interface Mind {
  /** Consecutive rest days taken. */
  n: number;
  /** The pace has been set once. */
  paced: boolean;
  /** The store being shopped, the items the van is full of, the last thing bought. */
  store: string | null;
  maxed: Set<string>;
  lastBuy: string | null;
}

/** A careful driver: keeps the tanks full, waits out the weather, downshifts the grade, swan-dives. */
function decide(o: Offer, shopped: Set<string>, restStreak: Mind): string | null {
  const key = (re: RegExp) => {
    const i = o.labels.findIndex((l) => re.test(l));
    return i >= 0 ? o.keys[i]! : null;
  };
  if (/OUTFITTING|SHOP —/.test(o.title)) {
    if (restStreak.store !== o.title) {
      restStreak.store = o.title;
      restStreak.maxed.clear();
      restStreak.lastBuy = null;
    }
    // "The van is full" retires the item just bought; an empty wallet ends the visit.
    if (/The van is full/.test(o.body) && restStreak.lastBuy) restStreak.maxed.add(restStreak.lastBuy);
    if (/Your wallet says no/.test(o.body)) return key(/Load up|Back to town/);
    const m = /(\d+) lbs food · (\d+) gal water · (\d+) gal fuel/.exec(o.body);
    if (!m) return key(/Load up|Back to town/);
    const [food, water, fuel] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const want: [string, boolean, RegExp][] = [
      ['water', water < 40, /^Buy water/],
      ['food', food < 150, /^Buy food/],
      ['gas', fuel < 40, /^Buy gas/],
    ];
    for (const [item, needed, re] of want) {
      if (needed && !restStreak.maxed.has(item)) {
        restStreak.lastBuy = item;
        return key(re);
      }
    }
    return key(/Load up|Back to town/);
  }
  const shop = key(/^Shop for supplies/);
  if (shop && !shopped.has(o.title)) {
    shopped.add(o.title);
    return shop;
  }
  if (key(/^Take the ferry/)) {
    const cash = Number(/cash\s*\$([\d.]+)/i.exec(o.body)?.[1] ?? 0);
    return cash >= 90 ? key(/^Take the ferry/) : key(/^Ford it/);
  }
  if (key(/^Ride the brakes/)) return key(/^Downshift/);
  if (key(/^Ride the 6% grade/)) return key(/^Ride the 6% grade/);
  if (key(/^Swan dive/)) return key(/^Swan dive/);
  const wait = key(/wait/i);
  if (wait && !key(/^Drive on$/)) return wait;
  if (/^PACE$/.test(o.title)) return key(/^Strenuous/);
  if (key(/^Drive on$/)) {
    if (!restStreak.paced) {
      restStreak.paced = true;
      return key(/^Change pace/);
    }
    const water = Number(/water\s*(\d+)\s*gal/i.exec(o.body)?.[1] ?? 0);
    const hurting = /CRITICAL|POOR/.test(o.body);
    // Resting dry only makes it worse; rest when there is water to rest on.
    if (hurting && water >= 15 && restStreak.n < 2) {
      restStreak.n += 1;
      return key(/^Rest a day/);
    }
    restStreak.n = 0;
    return key(/^Drive on$/);
  }
  return o.keys[0] ?? null;
}

async function outfit(page: Page): Promise<void> {
  await page.keyboard.press('1'); // Hit the road
  await page.keyboard.press('1'); // CEO
  await page.keyboard.press('3'); // May
  for (let i = 0; i < 5; i++) {
    // Take the suggested name. Focus explicitly: Heritage focuses its field on a timer.
    await page.locator('#comic-input, #input-field').focus();
    await page.keyboard.press('Enter');
  }
  for (let i = 0; i < 8; i++) await page.keyboard.press('3'); // 40 gal gas
  for (let i = 0; i < 4; i++) await page.keyboard.press('2'); // 40 gal water
  for (let i = 0; i < 8; i++) await page.keyboard.press('1'); // 200 lb food
  await page.keyboard.press('4');
  await page.keyboard.press('5');
  await page.keyboard.press('6');
  await page.keyboard.press('0'); // Load up and hit the road
}

/** Drive until the run ends. Returns the pages seen. */
async function drive(page: Page, maxSteps = 500): Promise<string[]> {
  const shopped = new Set<string>();
  const restStreak: Mind = { n: 0, paced: false, store: null, maxed: new Set(), lastBuy: null };
  const seen: string[] = [];
  const trace: string[] = [];
  for (let i = 0; i < maxSteps; i++) {
    const o = await offer(page);
    seen.push(o.title);
    if (/HERE ENDS THE RUN|SUNSET CLIFFS, SAN DIEGO/.test(o.title)) {
      if (/HERE ENDS THE RUN/.test(o.title)) console.log(`    last decisions:\n      ${trace.slice(-10).join('\n      ')}`);
      return seen;
    }
    if (/THE ROAD HAS TAKEN EVERYONE/.test(o.title)) {
      seen.push(/YOU HAVE DIED OF [^.]+\./.exec(o.body)?.[0] ?? 'YOU HAVE DIED.');
      await page.locator('#comic-input, #input-field').focus();
      await page.keyboard.type('WE WERE SO CLOSE');
      await page.keyboard.press('Enter');
      continue;
    }
    const k = decide(o, shopped, restStreak);
    if (!k) throw new Error(`nothing to press on "${o.title}": ${o.labels.join(' | ')}`);
    const aboard = /Aboard: [^·]+·[^·]+·[^·]+/.exec(o.body)?.[0] ?? /water\s*\d+\s*gal/i.exec(o.body)?.[0] ?? '';
    trace.push(`${i} ${o.title} → ${k} (${o.labels[o.keys.indexOf(k)] ?? '?'}) ${aboard}`);
    await page.keyboard.press(k);
  }
  throw new Error(`the run did not end in ${maxSteps} steps; last seen ${seen.slice(-5).join(' > ')}`);
}

function report(theme: string, seen: string[]): void {
  const stops = seen.filter((t, i) => t !== seen[i - 1] && !/THE ROAD|\* \* \*|OUTFITTING|SHOP —/.test(t));
  console.log(`  ${theme}: ${seen.length} screens, ended on "${seen[seen.length - 1]}" via ${stops.slice(0, 12).join(' > ')}${stops.length > 12 ? ' > …' : ''}`);
}

async function watchSfx(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __sfx: string[] };
    w.__sfx = [];
    new MutationObserver(() => {
      const word = document.querySelector('.sfx .word')?.textContent;
      if (word && w.__sfx[w.__sfx.length - 1] !== word) w.__sfx.push(word);
    }).observe(document.body, { subtree: true, childList: true });
  });
}

async function sfxSeen(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __sfx: string[] }).__sfx ?? []);
}

test.describe('the comic book', () => {
  test('plays from the outfitter to the end of the road, slamming words along the way', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort('connectionrefused')); // the API down: nothing changes
    await page.goto('/?theme=comic&seed=e2e-comic');
    await expect(page.locator('#comic.page-cover')).toBeVisible();
    await expect(page.locator('.mast-title')).toContainText('THE 8 WEST TRAIL');
    await watchSfx(page);
    await outfit(page);
    await expect(page.locator('#comic.page-road')).toBeVisible();
    await expect(page.locator('.stage .van')).toBeVisible();
    // Real art or placeholder, the van and the billboards stay inside their panel.
    const panelBox = (await page.locator('.page-road .panel').first().boundingBox())!;
    for (const drawn of ['.stage .van > *', '.stage .billboard > *']) {
      const boxes = await page.locator(drawn).evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
      for (const width of boxes) expect(width).toBeLessThanOrEqual(panelBox.width * 0.4);
    }
    await expect(page.locator('.stage .billboard')).toHaveCount(2);
    await expect(page.locator('.crew-panel .mate')).toHaveCount(5);
    await expect(page.locator('.balloons .balloon')).toHaveCount(3);
    await expect(page.locator('.signs .sign')).toHaveCount(4);

    const seen = await drive(page);
    report('comic', seen);
    expect(seen.some((t) => /^\* \* \*$|THE IMPERIAL SAND DUNES|THE IN-KO-PAH GRADE|LAGUNA SUMMIT/.test(t))).toBe(true);
    expect(seen.some((t) => /DEMING|LORDSBURG|TUCSON/.test(t))).toBe(true);
    const words = await sfxSeen(page);
    expect(words).toContain('KA-CHING!');
    expect(words).toContain('VROOOM');
    expect(words).toContain('HOORAY!');
    expect(words.length).toBeGreaterThan(3);
    // The driver is deterministic for the seed: this crew makes the beach.
    await expect(page.locator('#comic.page-victory')).toBeVisible();
    await expect(page.locator('.score .total').last()).toHaveText(/^\d+$/);
  });

  test('the cliff jump is a HOORAY with the score in a caption stack', async ({ page }) => {
    const cliffs = arriveAt(departed('e2e-cliffs', 5, 'sysadmin'), 'sunset-cliffs');
    await page.goto('/?theme=comic');
    await page.evaluate((state: GameState) => localStorage.setItem('8wt.save.v2', JSON.stringify(state)), cliffs);
    await page.reload();
    await watchSfx(page);
    await page.getByRole('button', { name: 'Continue the last run' }).click();
    await expect(page.locator('.title-caption')).toHaveText('SUNSET CLIFFS');
    await expect(page.locator('.balloons .balloon')).toHaveCount(3);
    await page.keyboard.press('2');
    await expect(page.locator('#comic.page-victory')).toBeVisible();
    await expect(page.locator('.score')).toContainText('Total');
    // The score on the page is the sim's score, to the point.
    const won = reduce(cliffs, { type: 'EVENT_CHOICE', index: 1 });
    const total = computeScore(won.crew, won.supplies, won.cash, won.occupation!).total;
    await expect(page.locator('.score .total').last()).toHaveText(String(total));
    await expect(page.locator('.narration-row')).toContainText('swan dive');
    expect(await sfxSeen(page)).toContain('HOORAY!');
    await expect(page.getByRole('button', { name: 'Copy your story' })).toBeVisible();
  });

  test('an event is a three-panel strip drawn with zero art, and real art loads over it when it exists', async ({ page }) => {
    const dunes = arriveAt(departed('e2e-dunes', 6, 'ceo'), 'imperial-dunes');
    await page.goto('/?theme=comic');
    await page.evaluate((state: GameState) => localStorage.setItem('8wt.save.v2', JSON.stringify(state)), dunes);
    await page.reload();
    await page.getByRole('button', { name: 'Continue the last run' }).click();
    await expect(page.locator('.title-caption')).toHaveText('THE IMPERIAL SAND DUNES');
    const frames = page.locator('.panels.three .panel');
    await expect(frames).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(frames.nth(i).locator('.panel-art > svg[data-strip="dunes-closure"]')).toHaveAttribute('data-frame', String(i));
    }
    // Every real file in the slot registers as an <img> that fades in once loaded.
    const real = page.locator('.panel-art img.real');
    const count = await real.count();
    for (let i = 0; i < count; i++) await expect(real.nth(i)).toHaveClass(/loaded/);
    await expect(page.locator('.balloons .balloon')).toHaveCount((await offer(page)).labels.filter((l) => !/supplies|map/.test(l)).length);
  });
});

test.describe('the green phosphor', () => {
  test('plays the same run in Heritage, untouched', async ({ page }) => {
    await page.goto('/?theme=heritage&seed=e2e-heritage&offline=1'); // the runtime switch: no network
    await expect(page.locator('#crt')).toBeVisible();
    await expect(page.locator('#screen-title')).toHaveText('THE 8 WEST TRAIL');
    await expect(page.locator('.mast-theme')).toHaveText('Back to color');
    await outfit(page);
    await expect(page.locator('#screen-title')).toHaveText('THE ROAD');
    await expect(page.locator('#status')).toBeVisible();
    const seen = await drive(page);
    report('heritage', seen);
    expect(seen.length).toBeGreaterThan(10);
    await expect(page.locator('#screen-title')).toHaveText('SUNSET CLIFFS, SAN DIEGO');
    expect(await page.locator('#comic').count()).toBe(0);
  });

  test('the toggle swaps themes and remembers the choice', async ({ page }) => {
    await page.goto('/?theme=comic');
    await page.getByRole('button', { name: 'Play it like 1985' }).click();
    await expect(page.locator('#crt')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('8wt.theme.v1'))).toBe('heritage');
    await page.goto('/'); // no ?theme= this time: the remembered choice decides
    await expect(page.locator('#crt')).toBeVisible();
    await page.getByRole('button', { name: 'Back to color' }).click();
    await expect(page.locator('#comic')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('8wt.theme.v1'))).toBe('comic');
  });
});
