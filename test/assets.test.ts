import { describe, expect, test } from 'vitest';
import {
  ALL_SLOTS,
  ASSET_EXTENSIONS,
  BILLBOARD_COUNT,
  CREW_COUNT,
  EVENT_STRIPS,
  REGION_SLUGS,
  SCENE_IDS,
  SFX_IDS,
  STOP_IDS,
  VAN_POSES,
  createAssetResolver,
  regionSlug,
} from '../src/ui/assets';

describe('the slot table is the asset-list contract', () => {
  test('twelve establishing-shot regions, numbered and slugged like the list', () => {
    expect(REGION_SLUGS).toHaveLength(12);
    expect(regionSlug(1)).toBe('01-mesilla');
    expect(regionSlug(7)).toBe('07-yuma');
    expect(regionSlug(12)).toBe('12-sunset-cliffs');
    expect(regionSlug(0)).toBe('01-mesilla');
    expect(regionSlug(99)).toBe('12-sunset-cliffs');
  });

  test('seventeen stop postcards keyed by route id', () => {
    expect(STOP_IDS).toHaveLength(17);
    expect(STOP_IDS[0]).toBe('las-cruces');
    expect(STOP_IDS[16]).toBe('sunset-cliffs');
  });

  test('the sixteen SFX words and the twenty-eight event strips (Kannon’s Dexcom strip included)', () => {
    expect(SFX_IDS).toHaveLength(16);
    expect(SFX_IDS).toContain('kaching');
    expect(SFX_IDS).toContain('wah-wah');
    expect(EVENT_STRIPS).toHaveLength(28);
    expect(EVENT_STRIPS).toContain('dexcom');
    expect(EVENT_STRIPS).toContain('tow-truck');
    expect(EVENT_STRIPS).toContain('the-grade');
  });

  test('eleven van poses, nine splash scenes, eight billboards, twelve crew', () => {
    expect(VAN_POSES).toHaveLength(11);
    expect(VAN_POSES).toContain('skid');
    expect(SCENE_IDS).toHaveLength(9);
    expect(SCENE_IDS).toContain('victory');
    expect(BILLBOARD_COUNT).toBe(8);
    expect(CREW_COUNT).toBe(12);
  });

  test('every slot is a bare base path: category/name, no extension, no leading slash', () => {
    expect(ALL_SLOTS.length).toBeGreaterThan(150);
    for (const slot of ALL_SLOTS) {
      expect(slot).toMatch(/^[a-z0-9-]+(\/[a-z0-9-]+)+$/);
    }
    expect(ALL_SLOTS).toContain('audio/grave-theme');
    expect(ALL_SLOTS).toContain('audio/sfx/bang');
    expect(ALL_SLOTS).toContain('audio/sfx/amb-ocean');
    expect(new Set(ALL_SLOTS).size).toBe(ALL_SLOTS.length);
    expect(ALL_SLOTS).toContain('brand/cover-01');
    expect(ALL_SLOTS).toContain('van/van-clean');
    expect(ALL_SLOTS).toContain('crew/05');
    expect(ALL_SLOTS).toContain('crew/05-critical');
    expect(ALL_SLOTS).toContain('regions/12-sunset-cliffs');
    expect(ALL_SLOTS).toContain('weather/dust-wall');
    expect(ALL_SLOTS).toContain('stops/yuma-plate');
    expect(ALL_SLOTS).toContain('sfx/hooray');
    expect(ALL_SLOTS).toContain('billboards/8westit-08');
    expect(ALL_SLOTS).toContain('billboards/plate-blank');
    expect(ALL_SLOTS).toContain('signage/tow-truck');
    expect(ALL_SLOTS).toContain('signage/guide-sign-blank');
    expect(ALL_SLOTS).toContain('events/runaway-ramp');
    expect(ALL_SLOTS).toContain('scenes/victory-night');
    expect(ALL_SLOTS).toContain('furniture/halftone');
    expect(ALL_SLOTS).toContain('heritage/crt-bezel');
    expect(ALL_SLOTS).toContain('audio/travel-day');
    expect(ALL_SLOTS).toContain('video/intro');
  });

  test('vector masters beat rasters, rasters beat everything else', () => {
    expect(ASSET_EXTENSIONS[0]).toBe('svg');
    expect(ASSET_EXTENSIONS).toContain('webp');
    expect(ASSET_EXTENSIONS).toContain('png');
  });
});

describe('the resolver', () => {
  const have = [
    'brand/8westit-logo.svg',
    'regions/03-texas-canyon.webp',
    'regions/03-texas-canyon-night.webp',
    'billboards/8westit-01.png',
    'billboards/8westit-02.svg',
    'billboards/8westit-02.png',
    'events/sushi.webp',
    'crew/03.png',
    'crew/03-rough.png',
    'sfx/bang.svg',
    'stops/yuma.webp',
    'van/van-clean.png',
    'audio/title-loop.mp3',
  ];
  const assets = createAssetResolver(have, '/assets/');

  test('a slot resolves to whatever file has landed, in any accepted format', () => {
    expect(assets.slot('brand/8westit-logo')).toBe('/assets/brand/8westit-logo.svg');
    expect(assets.slot('events/sushi')).toBe('/assets/events/sushi.webp');
    expect(assets.slot('van/van-clean')).toBe('/assets/van/van-clean.png');
    expect(assets.slot('audio/title-loop')).toBe('/assets/audio/title-loop.mp3');
  });

  test('a slot with no art is null — the renderer draws its placeholder', () => {
    expect(assets.slot('brand/8westventures-logo')).toBeNull();
    expect(assets.slot('events/snake')).toBeNull();
    expect(assets.has('events/snake')).toBe(false);
    expect(assets.has('events/sushi')).toBe(true);
  });

  test('an SVG master wins over a raster in the same slot', () => {
    expect(assets.slot('billboards/8westit-02')).toBe('/assets/billboards/8westit-02.svg');
    expect(assets.slot('billboards/8westit-01')).toBe('/assets/billboards/8westit-01.png');
  });

  test('typed helpers spell the list’s filenames so callers never do', () => {
    expect(assets.region(3)).toBe('/assets/regions/03-texas-canyon.webp');
    expect(assets.region(3, 'night')).toBe('/assets/regions/03-texas-canyon-night.webp');
    expect(assets.region(1)).toBeNull();
    expect(assets.stop('yuma')).toBe('/assets/stops/yuma.webp');
    expect(assets.stop('yuma', 'plate')).toBeNull();
    expect(assets.event('sushi')).toBe('/assets/events/sushi.webp');
    expect(assets.crew(3)).toBe('/assets/crew/03.png');
    expect(assets.crew(3, 'rough')).toBe('/assets/crew/03-rough.png');
    expect(assets.crew(3, 'critical')).toBeNull();
    expect(assets.crew(4)).toBeNull();
    expect(assets.sfx('bang')).toBe('/assets/sfx/bang.svg');
    expect(assets.sfx('hisss')).toBeNull();
    expect(assets.van('clean')).toBe('/assets/van/van-clean.png');
    expect(assets.van('skid')).toBeNull();
  });

  test('billboards are whatever numbered faces exist, in order, one URL per slot', () => {
    expect(assets.billboards()).toEqual(['/assets/billboards/8westit-01.png', '/assets/billboards/8westit-02.svg']);
    expect(createAssetResolver([], '/assets/').billboards()).toEqual([]);
  });

  test('backslashes and a leading slash in the manifest are tolerated', () => {
    const windowsy = createAssetResolver(['\\events\\snake.webp', '/crew/01.png'], '/assets/');
    expect(windowsy.event('snake')).toBe('/assets/events/snake.webp');
    expect(windowsy.crew(1)).toBe('/assets/crew/01.png');
  });

  test('files outside the slot table still resolve — the table is a guide, not a gate', () => {
    const extra = createAssetResolver(['regions/03-texas-canyon-sky.png'], '/assets/');
    expect(extra.slot('regions/03-texas-canyon-sky')).toBe('/assets/regions/03-texas-canyon-sky.png');
  });

  test('the base URL is honoured for embeds that live under a sub-path', () => {
    const embedded = createAssetResolver(['sfx/bang.svg'], '/trail/assets/');
    expect(embedded.sfx('bang')).toBe('/trail/assets/sfx/bang.svg');
  });
});
