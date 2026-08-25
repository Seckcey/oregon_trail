// The asset registry: which real art exists, and where every piece of art
// the Comic theme could ever want would live. The build scans public/assets/
// (see vite.config.ts) and injects the file list; a renderer asks this
// module for a URL and draws its own placeholder when the answer is null.
//
// Slots are bare base paths ("sfx/bang", "regions/07-yuma") with no
// extension: whatever file Frank drops in — an SVG master, a WebP, a PNG —
// fills the slot with no code change. Filenames follow docs/ASSET-LIST.md.

declare const __ASSET_MANIFEST__: string[] | undefined;

/** Accepted formats, best first: a vector master beats a raster in the same slot. */
export const ASSET_EXTENSIONS = ['svg', 'webp', 'png', 'jpg', 'jpeg', 'gif', 'mp3', 'ogg', 'mp4', 'webm'] as const;
export type AssetExtension = (typeof ASSET_EXTENSIONS)[number];

// ---------------------------------------------------------------------------
// The slot table — docs/ASSET-LIST.md, section by section
// ---------------------------------------------------------------------------

/** §5 — the twelve establishing-shot regions, west to east... east to west. */
export const REGION_SLUGS = [
  '01-mesilla',
  '02-dust-flats',
  '03-texas-canyon',
  '04-sonoran',
  '05-picacho',
  '06-lowlands',
  '07-yuma',
  '08-dunes',
  '09-imperial-valley',
  '10-in-ko-pah',
  '11-laguna',
  '12-sunset-cliffs',
] as const;
export type RegionSlug = (typeof REGION_SLUGS)[number];
/** Regions that also have a night plate in the list. */
const NIGHT_REGIONS: readonly number[] = [10, 11];

/** §7 — one postcard per route stop, keyed by the id in src/sim/data/route.ts. */
export const STOP_IDS = [
  'las-cruces',
  'deming',
  'lordsburg',
  'texas-canyon',
  'tucson',
  'picacho-peak',
  'casa-grande',
  'gila-bend',
  'dateland',
  'yuma',
  'center-of-the-world',
  'imperial-dunes',
  'el-centro',
  'in-ko-pah',
  'jacumba',
  'laguna-summit',
  'sunset-cliffs',
] as const;

/** §8 — the SFX lettering pack. */
export const SFX_IDS = [
  'screech',
  'krashh',
  'vroom',
  'bang',
  'hisss',
  'snap',
  'kaching',
  'zzz',
  'chomp',
  'sploosh',
  'whoosh',
  'kraka-boom',
  'rattle',
  'beep-beep',
  'wah-wah',
  'hooray',
] as const;
export type SfxId = (typeof SFX_IDS)[number];

/** §10 — the three-panel event strips. */
export const EVENT_STRIPS = [
  'flat-tire',
  'radiator',
  'belt',
  'sushi',
  'heatstroke',
  'snake',
  'speed-trap',
  'thief',
  'ransomware',
  'wrong-turn',
  'tailwind',
  'pecan-stand',
  'historic-80',
  'dust-storm',
  'monsoon',
  'tow-truck',
  'siphon',
  'memorial',
  'snack-stand',
  'date-shake',
  'river-ford',
  'river-ferry',
  'dunes-closure',
  'hot-springs',
  'runaway-ramp',
  'the-grade',
  'old-80',
  'dexcom',
] as const;
export type EventStripId = (typeof EVENT_STRIPS)[number];

/** §3 — the van, in every pose the list asks for. */
export const VAN_POSES = ['clean', 'dusty', 'battered', 'wheel', 'hero', 'skid', 'airborne', 'steam', 'splash', 'night', 'dashboard'] as const;
export type VanPose = (typeof VAN_POSES)[number];

/** §11 — full-page splashes. */
export const SCENE_IDS = ['outfitter', 'loading', 'tucson', 'yuma-decision', 'laguna-decision', 'victory', 'victory-night', 'memorial', 'game-over'] as const;
export type SceneId = (typeof SCENE_IDS)[number];

/** §6 — weather plates layered over the establishing shot. */
export const WEATHER_IDS = ['dust-wall', 'monsoon', 'heat', 'stars'] as const;
export type WeatherPlateId = (typeof WEATHER_IDS)[number];

/** §2 — brand and identity, plus the Phase 2 logo slots the brief still wants. */
export const BRAND_IDS = [
  'masthead',
  'cover-01',
  'cover-01-plate',
  'icon',
  'og-card',
  'presented-by',
  'ventures-plate',
  'splash',
  'splash-wide',
  'title-lockup',
  'title-stacked',
  '8westit-logo',
  '8westit-logo-light',
  '8westit-avatar',
  '8westventures-logo',
  '8westventures-logo-light',
  '8westventures-logo-stacked',
  'interstate-8',
] as const;
export type BrandId = (typeof BRAND_IDS)[number];

/** §9 — the parent-company winks and the highway signage kit. */
export const SIGNAGE_IDS = [
  'water-tower',
  'ghost-sign',
  'tow-truck',
  'shield-i8',
  'shield-historic-80',
  'guide-sign-blank',
  'exit-sign',
  'mile-marker',
  'sign-dust-storms',
  'sign-flash-flood',
  'sign-grade',
  'sign-runaway-ramp',
  'sign-sea-level',
  'sign-end-8',
  'sign-outfitter',
] as const;
export type SignageId = (typeof SIGNAGE_IDS)[number];

/** §12 — page furniture references (the game draws these in CSS/SVG; real files are optional). */
export const FURNITURE_IDS = ['paper', 'halftone', 'burst', 'balloon-sheet', 'panel-corners'] as const;
/** §13 — the icon reference sheet. */
export const ICON_IDS = ['reference-sheet'] as const;
/** §14 — Heritage extras. */
export const HERITAGE_IDS = ['crt-bezel', 'toggle-heritage', 'toggle-comic'] as const;
/** §15 — music (audio-asset-brief.md §4–§5). Everything loops except `victory` and `death-sting`. */
export const AUDIO_IDS = [
  'title-loop',
  'travel-day',
  'travel-night',
  'victory',
  'death-sting',
  'outfitter-loop',
  'stop-loop',
  'grade-tension',
  'crossing-tension',
  'snack-loop',
  'grave-theme',
] as const;
export type AudioId = (typeof AUDIO_IDS)[number];
/** Music tracks that loop; the rest play once. */
export const MUSIC_LOOPS: ReadonlySet<AudioId> = new Set<AudioId>(AUDIO_IDS.filter((id) => id !== 'victory' && id !== 'death-sting'));

/**
 * §15 — sound effects (audio-asset-brief.md §6–§13), under audio/sfx/. The first sixteen are the
 * lettering pack and share their names with the SFX_IDS art, so a slammed word plays its own sound.
 */
export const AUDIO_SFX_IDS = [
  // the lettering pack
  ...SFX_IDS,
  // user interface
  'ui-move',
  'ui-select',
  'ui-back',
  'ui-page-turn',
  'ui-panel-slam',
  'ui-balloon-pop',
  'ui-type-key',
  'ui-type-ding',
  'ui-error',
  'ui-notice',
  // the van
  'van-start',
  'van-idle',
  'van-cruise-day',
  'van-cruise-strain',
  'van-brakes',
  'van-downshift',
  'van-door',
  'van-horn',
  'van-gravel',
  // weather and ambience beds (loops)
  'amb-desert-day',
  'amb-desert-night',
  'amb-heat',
  'amb-dust-storm',
  'amb-monsoon',
  'amb-mountain',
  'amb-ocean',
  'amb-town',
  'amb-store',
  // event foley
  'ev-snake',
  'ev-heatstroke',
  'ev-speed-trap',
  'ev-thief',
  'ev-ransomware',
  'ev-sushi',
  'ev-wrong-turn',
  'ev-tailwind',
  'ev-pecan-stand',
  'ev-historic-80',
  'ev-flat-tire',
  'ev-radiator',
  'ev-belt',
  'ev-tow-truck',
  'ev-river-ford',
  'ev-river-ferry',
  'ev-runaway-ramp',
  'ev-dunes',
  'ev-hot-springs',
  'ev-date-shake',
  'ev-border-checkpoint',
  'ev-sea-level',
  'ev-insulin-cooler',
  'ev-memorial',
  'ev-snack-stand',
  // landmarks, minigame, the ending
  'snack-hit',
  'snack-miss',
  'stop-arrive',
  'victory-fireworks',
  'grave-shovel',
] as const;
export type AudioSfxId = (typeof AUDIO_SFX_IDS)[number];
/** §16 — video. */
export const VIDEO_IDS = ['intro', 'billboards-loop'] as const;

/** §4 — the twelve named crew, each with a headshot and its sheets. */
export const CREW_COUNT = 12;
export type CrewSheet = 'model' | 'poses' | 'rough' | 'critical';
const CREW_SHEETS: readonly CrewSheet[] = ['model', 'poses', 'rough', 'critical'];
const CREW_GROUPS = ['group-windshield', 'group-lineup'] as const;

/** §9 — numbered 8 West IT billboard faces, plus the blank plate for in-engine lettering. */
export const BILLBOARD_COUNT = 8;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function vanSlot(pose: VanPose): string {
  return pose === 'dashboard' ? 'van/dashboard' : `van/van-${pose}`;
}

function crewSlot(index: number, sheet?: CrewSheet): string {
  return sheet ? `crew/${pad2(index)}-${sheet}` : `crew/${pad2(index)}`;
}

function billboardSlot(n: number): string {
  return `billboards/8westit-${pad2(n)}`;
}

function buildAllSlots(): readonly string[] {
  const slots: string[] = [];
  for (const id of BRAND_IDS) slots.push(`brand/${id}`);
  for (const pose of VAN_POSES) slots.push(vanSlot(pose));
  for (let i = 1; i <= CREW_COUNT; i++) {
    slots.push(crewSlot(i));
    for (const sheet of CREW_SHEETS) slots.push(crewSlot(i, sheet));
  }
  for (const group of CREW_GROUPS) slots.push(`crew/${group}`);
  REGION_SLUGS.forEach((slug, i) => {
    slots.push(`regions/${slug}`);
    if (NIGHT_REGIONS.includes(i + 1)) slots.push(`regions/${slug}-night`);
  });
  for (const id of WEATHER_IDS) slots.push(`weather/${id}`);
  for (const id of STOP_IDS) slots.push(`stops/${id}`, `stops/${id}-plate`);
  for (const id of SFX_IDS) slots.push(`sfx/${id}`);
  for (let i = 1; i <= BILLBOARD_COUNT; i++) slots.push(billboardSlot(i));
  slots.push('billboards/plate-blank');
  for (const id of SIGNAGE_IDS) slots.push(`signage/${id}`);
  for (const id of EVENT_STRIPS) slots.push(`events/${id}`);
  for (const id of SCENE_IDS) slots.push(`scenes/${id}`);
  for (const id of FURNITURE_IDS) slots.push(`furniture/${id}`);
  for (const id of ICON_IDS) slots.push(`icons/${id}`);
  for (const id of HERITAGE_IDS) slots.push(`heritage/${id}`);
  for (const id of AUDIO_IDS) slots.push(`audio/${id}`);
  for (const id of AUDIO_SFX_IDS) slots.push(`audio/sfx/${id}`);
  for (const id of VIDEO_IDS) slots.push(`video/${id}`);
  return slots;
}

/** Every slot the asset list names, as bare base paths. */
export const ALL_SLOTS: readonly string[] = buildAllSlots();

export function regionSlug(region: number): RegionSlug {
  const clamped = Math.min(REGION_SLUGS.length, Math.max(1, Math.round(region)));
  return REGION_SLUGS[clamped - 1]!;
}

// ---------------------------------------------------------------------------
// The resolver
// ---------------------------------------------------------------------------

export interface AssetResolver {
  /** True when any accepted file fills the slot. */
  has(slot: string): boolean;
  /** URL of the best file in the slot (vector first), or null for a placeholder. */
  slot(slot: string): string | null;
  region(region: number, variant?: 'night'): string | null;
  stop(id: string, variant?: 'plate'): string | null;
  event(id: string): string | null;
  crew(index: number, sheet?: CrewSheet): string | null;
  sfx(id: string): string | null;
  van(pose: VanPose): string | null;
  scene(id: SceneId): string | null;
  weather(id: WeatherPlateId): string | null;
  brand(id: BrandId): string | null;
  signage(id: SignageId): string | null;
  furniture(id: (typeof FURNITURE_IDS)[number]): string | null;
  audio(id: AudioId): string | null;
  audioSfx(id: AudioSfxId): string | null;
  /** Every numbered 8 West IT billboard face that exists, in order. */
  billboards(): string[];
}

function normalize(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

function splitExtension(file: string): { base: string; ext: string } | null {
  const dot = file.lastIndexOf('.');
  if (dot <= 0) return null;
  return { base: file.slice(0, dot), ext: file.slice(dot + 1).toLowerCase() };
}

export function createAssetResolver(manifest: readonly string[], base = '/assets/'): AssetResolver {
  // slot base path → the extensions present, e.g. "sfx/bang" → Set{"svg","png"}
  const slots = new Map<string, Set<string>>();
  for (const raw of manifest) {
    const split = splitExtension(normalize(raw));
    if (!split || !(ASSET_EXTENSIONS as readonly string[]).includes(split.ext)) continue;
    const exts = slots.get(split.base) ?? new Set<string>();
    exts.add(split.ext);
    slots.set(split.base, exts);
  }

  const slot = (path: string): string | null => {
    const exts = slots.get(normalize(path));
    if (!exts) return null;
    for (const ext of ASSET_EXTENSIONS) {
      if (exts.has(ext)) return `${base}${normalize(path)}.${ext}`;
    }
    return null;
  };

  return {
    has: (path) => slots.has(normalize(path)),
    slot,
    region: (region, variant) => slot(`regions/${regionSlug(region)}${variant ? `-${variant}` : ''}`),
    stop: (id, variant) => slot(`stops/${id}${variant ? `-${variant}` : ''}`),
    event: (id) => slot(`events/${id}`),
    crew: (index, sheet) => slot(crewSlot(index, sheet)),
    sfx: (id) => slot(`sfx/${id}`),
    van: (pose) => slot(vanSlot(pose)),
    scene: (id) => slot(`scenes/${id}`),
    weather: (id) => slot(`weather/${id}`),
    brand: (id) => slot(`brand/${id}`),
    signage: (id) => slot(`signage/${id}`),
    furniture: (id) => slot(`furniture/${id}`),
    audio: (id) => slot(`audio/${id}`),
    audioSfx: (id) => slot(`audio/sfx/${id}`),
    billboards: () => {
      const urls: string[] = [];
      for (let i = 1; i <= BILLBOARD_COUNT; i++) {
        const url = slot(billboardSlot(i));
        if (url) urls.push(url);
      }
      return urls;
    },
  };
}

/** The resolver for the running build (empty when no art has landed). */
export const assets: AssetResolver = createAssetResolver(
  typeof __ASSET_MANIFEST__ !== 'undefined' ? __ASSET_MANIFEST__ : [],
);
