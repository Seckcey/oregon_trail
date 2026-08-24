// The placeholder registry: an inked SVG for every art reference the page
// compositor can produce and for every slot in the asset list, so the comic
// looks like a comic with zero supplied art. Real files replace these one
// slot at a time (see src/ui/assets.ts).

import { CREW_COUNT, type EventStripId, type SceneId, type SfxId, type SignageId, type VanPose, EVENT_STRIPS, SCENE_IDS, SFX_IDS, SIGNAGE_IDS, VAN_POSES } from '../assets';
import { crewHeadSvg, crewRowSvg } from './art-crew';
import { regionSvg, weatherSvg } from './art-regions';
import { billboardSvg, coverSvg, plateSvg, sceneSvg, sfxSvg, signageSvg, stopSvg } from './art-scenes';
import { stripFrameSvg, stripSvg } from './art-strips';
import { vanSvg } from './art-van';
import { CAST } from './cast';
import type { ArtRef, CrewMood } from './layout';

export { crewHeadSvg, crewRowSvg } from './art-crew';
export { regionSvg, weatherSvg } from './art-regions';
export { billboardSvg, coverSvg, sceneSvg, sfxSvg, signageSvg, stopSvg, plateSvg, BILLBOARD_TAGLINES } from './art-scenes';
export { stripFrameSvg, stripSvg } from './art-strips';
export { vanSvg } from './art-van';

/** The twelve characters, for anyone who needs names beside faces. */
export const CREW = CAST;

export function placeholderSvg(ref: ArtRef): string {
  switch (ref.kind) {
    case 'region':
      return regionSvg(ref.region);
    case 'event':
      return stripFrameSvg(ref.stripId, ref.frame, ref.cast ?? []);
    case 'stop':
      return stopSvg(ref.stopId);
    case 'scene':
      return sceneSvg(ref.sceneId);
    case 'cover':
      return coverSvg();
    case 'van':
      return vanSvg(ref.pose);
    case 'crew':
      return crewRowSvg(ref.cast, ref.moods);
  }
}

function includes<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
}

const SHEET_MOODS: Record<string, CrewMood> = { rough: 'poor', critical: 'critical' };

/** A placeholder for any slot path in the asset list (category/name, no extension). */
export function placeholderForSlot(slot: string): string {
  const [category = '', name = ''] = slot.replace(/\\/g, '/').replace(/^\/+/, '').split('/');
  switch (category) {
    case 'brand':
      if (name.startsWith('cover') || name === 'og-card' || name.startsWith('splash')) return coverSvg();
      if (name === 'icon') return signageSvg('shield-i8');
      return plateSvg(name.replace(/-/g, ' '));
    case 'van': {
      const pose = name === 'dashboard' ? 'dashboard' : name.replace(/^van-/, '');
      return vanSvg(includes(VAN_POSES, pose) ? (pose as VanPose) : 'clean');
    }
    case 'crew': {
      if (name.startsWith('group')) {
        const cast = Array.from({ length: name === 'group-lineup' ? CREW_COUNT : 5 }, (_, i) => i + 1);
        return crewRowSvg(cast, cast.map(() => 'good'));
      }
      const [num = '1', sheet = ''] = name.split('-');
      return crewHeadSvg(Number(num) || 1, SHEET_MOODS[sheet] ?? 'good');
    }
    case 'regions': {
      const region = Number(name.slice(0, 2)) || 1;
      return name.endsWith('-night') ? `${regionSvg(region).replace('</svg>', '')}${weatherSvg('stars').replace(/^<svg[^>]*>/, '').replace(/<defs>.*?<\/defs>/, '')}` : regionSvg(region);
    }
    case 'weather':
      return weatherSvg(name === 'dust-wall' || name === 'monsoon' || name === 'heat' || name === 'stars' ? name : 'heat');
    case 'stops':
      return stopSvg(name.replace(/-plate$/, ''));
    case 'sfx':
      return sfxSvg(includes(SFX_IDS, name) ? (name as SfxId) : 'bang');
    case 'billboards': {
      if (name === 'plate-blank') return billboardSvg(0);
      return billboardSvg(Number(name.replace(/^8westit-/, '')) || 1);
    }
    case 'signage':
      return signageSvg(includes(SIGNAGE_IDS, name) ? (name as SignageId) : 'guide-sign-blank');
    case 'events':
      return stripSvg(includes(EVENT_STRIPS, name) ? (name as EventStripId) : 'flat-tire');
    case 'scenes':
      return sceneSvg(includes(SCENE_IDS, name) ? (name as SceneId) : 'loading');
    case 'furniture':
    case 'icons':
    case 'heritage':
    case 'audio':
    case 'video':
    default:
      return plateSvg(name.replace(/-/g, ' ') || slot);
  }
}

/** An SVG string as an image source. */
export function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}`;
}
