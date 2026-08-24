# Phase 2 Brief — The 8 West Trail

*Written 2026-08-24 at the close of Phase 1. Read this after README.md and docs/PLAN.md.*

## Where we are

Phase 1 is live at https://8wt.8westit.com: Las Cruces → Tucson, green-phosphor terminal UI,
deterministic sim core with 103 tests, deployed by Docker on coastline (`~/apps/eight-west-trail`,
`127.0.0.1:1985`, Cloudflare tunnel). The sim is pure and UI-agnostic — Phase 2 builds *on* it,
never around it.

## Phase 2 scope (Frank's direction, 2026-08-24)

Three things, in priority order:

### 1. Two themes with a toggle

- **Heritage** — the current green-phosphor terminal. Keep it exactly as it is; it's the
  nostalgia. Frank loves it.
- **Coastal** (working name) — new, bright, colorful, modern, *graphical*: scenes, art, motion.
  Flashy. This becomes the default (marketing wants the flash); the toggle is prominent on
  every screen ("Play it like 1985" / "Back to color") and persists in localStorage.
- The toggle must be a pure presentation swap. One sim, one Screen model, two renderers (or one
  renderer with two skins — decide during design). Nothing in `src/sim/` changes for theming.

### 2. Branding: lots of 8 West IT, subtle 8 West Ventures

- **8 West IT / 8 West IT 365** everywhere it makes diegetic sense: the van's door magnets,
  highway billboards scrolling past while you drive, the outfitter's sign, the tow truck,
  the victory banner, the share card. Loud is fine here — this is the marketing tool.
- **8 West Ventures, LLC** (the parent) as *subtle hints*: an "an 8 West Ventures company"
  plate in the footer and on the title lockup, a water tower or hangar sign in one backdrop,
  the interstate-shield motif and red/blue palette borrowed from the Ventures brand, maybe the
  ferry at Yuma named after it. Winks, not billboards.
- Brand sources (both repos are private under Seckcey; `gh api` works from this machine):
  - `Seckcey/8westventures-website` — `assets/img/logo-horizontal.png`,
    `logo-stacked-dark.png`, `logo-stacked-white.png`, **`interstate-8.png`**, `hero-banner.png`,
    `hero.mp4`; tokens in `assets/css/styles.css`: red `#c41e2a` (interstate banner red),
    blue `#1f8fd6` (ocean wave), ink `#0c1830`, bg-light `#f4f7fc`; fonts Montserrat (heads)
    + Inter (body).
  - `Seckcey/8westit-website` — `assets/avatar-primary.svg`, `assets/avatar-light.svg`,
    `assets/brand/suite/8-west-it-command-center.svg`, `ewid-mark.svg`; root `styles.css` is a
    dark navy theme with lighthouse tokens (`--lamp` gold, `--signal` blue, `--beam` cyan),
    Inter + a mono face. The live site is https://8westit.com.
  - Ask Frank for SVG masters of both logos if only PNG exists.

### 3. The full route: Tucson → Sunset Cliffs

Stops 6–17 from PLAN.md, with the new mechanics they carry:

- **Casa Grande** (mile 340): "where the 8 truly begins" — the junction moment.
- **Gila Bend / Gila River** (410): first real crossing — ford / detour / pay / wait.
- **Dateland** (480): date shakes (morale/health bump, once).
- **Yuma / Colorado River** (550): the big crossing. Ford (depth × current risk), the
  "caulk-and-float" analog (raft the van on a flatbed — risky), the ferry (costs cash,
  waits), or wait for the level to drop. Model on Bouchard's ~2.5-ft threshold idea.
- **Center of the World** (565): flavor stop, quirky.
- **Imperial Dunes** (585): wind closures — sand across the road; push/wait choices.
- **El Centro** (610): below sea level; heat spikes; shop.
- **In-Ko-Pah Grade** (640): van wear ×2; overheating; runaway-ramp event.
- **Jacumba** (660): last shop; hot springs rest bonus.
- **Laguna Summit** (690): THE FINALE. Choose: **ride the 6% grade** (fast, free, brakes
  smoking — a real set-piece with a brake-temperature minigame) or **Old Highway 80** (slow,
  winding, weather risk). Both fully written.
- **Sunset Cliffs** (730): victory at the Pacific — the crew celebrates by cliff jumping into the ocean where the 8 dead-ends (Frank changed the finish from Ocean Beach on 2026-08-24).
- Also: **van repairs at shops** (cash for condition), Tucson becomes a milestone screen not an
  ending, and the phase1EndMile gate goes away (keep a "PHASE" marker in the score screen).

## Definition of done

- Full route playable start to finish in both themes; theme toggle persists.
- Sim changes are TDD'd like Phase 1; the 103 tests still pass plus the new ones.
- Brand assets integrated; placeholders replaced by real art wherever Frank supplied it.
- Bundle stays light: first load < ~2 MB, region art lazy-loaded.
- Deployed to coastline:1985 and verified at https://8wt.8westit.com.
- Site copy still never prints the words "Oregon Trail" (trademark discipline). Gameplay may
  be as obviously the homage as it likes.

## Working rules (from Frank's global CLAUDE.md)

- Investigation and planning at low effort; **announce "ready to code — raise effort" and stop**
  before writing code; Frank sets max.
- End every reply with a recommended next effort level.
- Delegate fan-outs to cheap models; keep judgment and code on the frontier model.

---

# Asset list for Frank

Formats: **SVG** for logos, icons, signage. **WebP** for scenes/photos (quality 80). **PNG with
transparency** for sprites/cutouts at 2× the display size. **MP4 (H.264) + WebM** for any video,
under 3 MB each. Drop files in `public/assets/<category>/` using the filenames below — **the game
ships SVG placeholders for every item, so nothing here blocks the build**; real art replaces
placeholders as it lands.

### A. Pull from existing repos (no action needed — the session fetches these)

| File | Source |
|---|---|
| 8 West Ventures logos (horizontal, stacked dark/white), `interstate-8.png`, `hero.mp4`, brand tokens | `Seckcey/8westventures-website` |
| 8 West IT marks (`avatar-primary.svg`, `avatar-light.svg`, suite marks), brand tokens | `Seckcey/8westit-website` |

**Please supply if they exist:** SVG masters of the 8 West IT logo and the 8 West Ventures logo
→ `public/assets/brand/8westit-logo.svg`, `8westventures-logo.svg`.

### B. Tier 1 — the theme can't be flashy without these

| # | Asset | Spec | Filename |
|---|---|---|---|
| 1 | **Title lockup** "THE 8 WEST TRAIL" in interstate-shield style, with "presented by 8 West IT" and a tiny "an 8 West Ventures company" | SVG, horizontal + stacked | `brand/title-lockup.svg`, `brand/title-stacked.svg` |
| 2 | **The van** — 1985 Econoline, side view, 8 West IT door magnets, white/red/blue livery | PNG transparent, 1600×800; ideally wheels as a separate layer; 3 states: clean / dusty / battered | `van/van-clean.png`, `van-dusty.png`, `van-battered.png`, `van-wheel.png` |
| 3 | **Region backdrops** (8) — wide parallax panoramas: (1) Mesilla valley pecans + Organ Mountains, (2) Deming–Lordsburg dust flats, (3) Texas Canyon boulders → Sonoran saguaro, (4) Picacho / Casa Grande farmland, (5) Gila Bend / Dateland lowlands, (6) Yuma / Colorado River + Imperial Dunes, (7) In-Ko-Pah boulders + Laguna pines, (8) Sunset Cliffs at sunset | WebP 2400×900; if possible 3 layers each (sky / mid / road) as separate PNGs for parallax | `regions/01-mesilla.webp` … `08-sunset-cliffs.webp` (+ `-sky`, `-mid`, `-road` layers) |
| 4 | **Stop postcards** (17, or the 6 majors minimum: Las Cruces, Tucson, Yuma, El Centro, Laguna Summit, Sunset Cliffs) | WebP 800×500, vintage-postcard style | `stops/<stop-id>.webp` (ids in `src/sim/data/route.ts`) |
| 5 | **Billboards** — 6–8 highway billboards for 8 West IT 365 (fun taglines: "We fix it before it breaks", "365 days. Zero fire drills.", "Your IT, on the road with you", etc.) + 2 subtle Ventures ones ("an 8 West Ventures company" plate; a water tower reading 8 WEST) | SVG or PNG 1200×400 | `billboards/8westit-01.svg` … `8westventures-01.svg` |

### C. Tier 2 — depth and delight

| # | Asset | Spec | Filename |
|---|---|---|---|
| 6 | **Crew portraits** — 12 diverse modern-cartoon avatars | PNG transparent 512×512 | `crew/01.png` … `12.png` |
| 7 | **Event cards** (~13): gas-station sushi, rattlesnake rest stop, flat tire, radiator steam, dust-storm wall, monsoon wash, tow truck (8 West IT livery, "Roadside Div."), ransomware laptop, speed trap, snack stand, pecan stand, Historic US 80 sign, roadside memorial | WebP 800×600 | `events/<event-id>.webp` (ids in `src/sim/events.ts`) |
| 8 | **Icon set**: food, water, fuel, tire, belt, hose, cash, van, pace ×3, rations ×3, weather (mild/warm/hot/scorching/dust/monsoon) | SVG, single color + accent, 24px grid | `icons/<name>.svg` |
| 9 | **Victory scene** — van parked at the top of Sunset Cliffs at sunset, crew silhouettes mid-jump; **memorial scene** — roadside cross at dusk | WebP 1920×1080 | `scenes/victory.webp`, `scenes/memorial.webp` |

### D. Tier 3 — optional polish

| # | Asset | Spec | Filename |
|---|---|---|---|
| 10 | **Audio**: title loop + travel loop (surf-rock meets synthwave, 60–90 s, seamless), SFX: engine start, tire BANG, cash register, typewriter tick, ocean arrival, sad trombone (deaths) | MP3 + OGG, loops < 1 MB | `audio/*.mp3` |
| 11 | **Intro sting** — 5–8 s video: shield logo → van pulls out → title | MP4 + WebM, ≤ 3 MB, or reuse the Ventures `hero.mp4` | `video/intro.mp4` |

Anything not supplied gets an SVG placeholder in the same slot. Prioritize the van, the title
lockup, and the billboards — those three carry the brand.
