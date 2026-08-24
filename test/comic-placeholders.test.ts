import { describe, expect, test } from 'vitest';
import { ALL_SLOTS, SFX_IDS, createAssetResolver } from '../src/ui/assets';
import { artSource } from '../src/ui/comic/art';
import {
  BILLBOARD_TAGLINES,
  CREW,
  billboardSvg,
  crewHeadSvg,
  placeholderForSlot,
  placeholderSvg,
  regionSvg,
  sfxSvg,
  svgDataUri,
  vanSvg,
} from '../src/ui/comic/placeholders';

const isSvg = (s: string) => s.trimStart().startsWith('<svg') && s.trimEnd().endsWith('</svg>');

describe('the cast', () => {
  test('twelve original characters with the names and looks from the asset list', () => {
    expect(CREW).toHaveLength(12);
    expect(CREW.map((c) => c.name)).toEqual(['Wes', 'Dot', 'Cache', 'Sol', 'Piper', 'Hank', 'Sky', 'Ping', 'Rosa', 'Bo', 'Marge', 'Kit']);
    expect(CREW[0]!.id).toBe(1);
  });

  test('every character has a distinct head in every mood, and the moods differ', () => {
    const heads = new Set<string>();
    for (const c of CREW) {
      for (const mood of ['good', 'fair', 'poor', 'critical', 'lost'] as const) {
        const svg = crewHeadSvg(c.id, mood);
        expect(isSvg(svg)).toBe(true);
        heads.add(svg);
      }
    }
    expect(heads.size).toBe(60);
  });
});

describe('the van', () => {
  test('white, with the red-over-blue stripe, and nothing that belongs to anyone else', () => {
    for (const pose of ['clean', 'dusty', 'battered'] as const) {
      const svg = vanSvg(pose);
      expect(isSvg(svg)).toBe(true);
      expect(svg).toContain('#C41E2A');
      expect(svg).toContain('#1F8FD6');
      expect(svg).toContain('8 WEST IT');
      expect(svg.toLowerCase()).not.toMatch(/teal|flower|mystery machine|#008080/);
    }
    expect(vanSvg('clean')).not.toBe(vanSvg('battered'));
  });
});

describe('places and things', () => {
  test('twelve regions, each its own horizon', () => {
    const seen = new Set<string>();
    for (let r = 1; r <= 12; r++) {
      const svg = regionSvg(r);
      expect(isSvg(svg)).toBe(true);
      seen.add(svg);
    }
    expect(seen.size).toBe(12);
  });

  test('billboards letter the taglines in-engine with the brand on every one', () => {
    expect(BILLBOARD_TAGLINES).toHaveLength(8);
    for (let n = 1; n <= 8; n++) {
      const svg = billboardSvg(n);
      expect(isSvg(svg)).toBe(true);
      expect(svg).toContain('8 WEST IT 365');
      expect(svg).toContain(BILLBOARD_TAGLINES[n - 1]!.split(' ')[0]!);
    }
  });

  test('SFX bursts carry their word', () => {
    for (const id of SFX_IDS) {
      const svg = sfxSvg(id);
      expect(isSvg(svg)).toBe(true);
    }
    expect(sfxSvg('bang')).toContain('BANG!');
    expect(sfxSvg('kaching')).toContain('KA-CHING!');
  });
});

describe('placeholders cover the whole slot table', () => {
  test('every slot in the asset list gets an SVG, and none of them prints the other game’s name', () => {
    for (const slot of ALL_SLOTS) {
      const svg = placeholderForSlot(slot);
      expect(isSvg(svg), slot).toBe(true);
      expect(svg).not.toMatch(/oregon/i);
    }
  });

  test('every art reference the layout can produce has a placeholder', () => {
    const refs = [
      { kind: 'region', region: 4, weather: 'dust', heat: 3, van: 'dusty', moving: true },
      { kind: 'event', stripId: 'flat-tire', frame: 1 },
      { kind: 'stop', stopId: 'yuma' },
      { kind: 'scene', sceneId: 'victory' },
      { kind: 'cover' },
      { kind: 'van', pose: 'steam' },
      { kind: 'crew', cast: [1, 2, 3, 4, 5], moods: ['good', 'fair', 'poor', 'critical', 'lost'] },
    ] as const;
    for (const ref of refs) expect(isSvg(placeholderSvg(ref)), ref.kind).toBe(true);
  });

  test('a data URI wraps the SVG for use as an image source', () => {
    const uri = svgDataUri('<svg xmlns="http://www.w3.org/2000/svg"><text>#1 & "two"</text></svg>');
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(uri).not.toContain('#');
    expect(uri).not.toContain('"');
  });
});

describe('artSource — real art when it has landed, the placeholder when it has not', () => {
  test('resolves the slot behind an art reference', () => {
    const none = createAssetResolver([], '/assets/');
    const some = createAssetResolver(['regions/04-sonoran.webp', 'scenes/victory.webp', 'events/flat-tire.webp', 'stops/yuma.webp', 'van/van-steam.png', 'crew/02.png'], '/assets/');
    const region = { kind: 'region', region: 4, weather: 'none', heat: 0, van: 'clean', moving: false } as const;
    expect(artSource(region, none).url).toBeNull();
    expect(isSvg(artSource(region, none).placeholder)).toBe(true);
    expect(artSource(region, some).url).toBe('/assets/regions/04-sonoran.webp');
    expect(artSource({ kind: 'scene', sceneId: 'victory' }, some).url).toBe('/assets/scenes/victory.webp');
    expect(artSource({ kind: 'event', stripId: 'flat-tire', frame: 2 }, some).url).toBe('/assets/events/flat-tire.webp');
    expect(artSource({ kind: 'stop', stopId: 'yuma' }, some).url).toBe('/assets/stops/yuma.webp');
    expect(artSource({ kind: 'van', pose: 'steam' }, some).url).toBe('/assets/van/van-steam.png');
    expect(artSource({ kind: 'cover' }, some).url).toBeNull();
  });
});
