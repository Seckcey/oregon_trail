# Phase 3 Brief — The Comic-Book Edition

*Written 2026-08-24. Read after README.md, docs/PLAN.md, and docs/PHASE2-BRIEF.md. The asset
list in docs/ASSET-LIST.md is already rewritten for this direction.*

## The pivot

Frank's call (2026-08-24): the modern theme is **not** the sun-bleached travel-poster "Coastal"
look Phase 2 built. It is a **Saturday-morning mystery comic book** — the DC-era all-ages
mystery-gang look: thick uniform black ink outlines, flat saturated cel colors with hard two-tone
shadows, exaggerated expressions, tilted action panels, speed lines and dust puffs, giant
onomatopoeia lettering (SCREEECH, KRASHH, VROOOM), speech balloons with tails, yellow caption
boxes, halftone in the shadows, white gutters between panels.

This is not a reskin. **In a comic-book game the interface is the comic page.** Phase 3 replaces
the Coastal renderer with a **Comic renderer**; Heritage (green phosphor) stays exactly as it is
and remains the other side of the toggle.

## IP discipline (important)

The *style* is a homage; the *content* is ours. Original characters only (the twelve named crew
in the asset list). The van is white with a red-over-blue stripe — never teal/green, never
flowers, never psychedelic, no famous dogs, no "mystery machine" wording. And as always, the
words "Oregon Trail" never appear in site copy.

## What the Comic renderer is

Every Screen from the sim renders as a **comic page** built from panels:

- **Travel screen** = a page. Top: a wide establishing-shot panel (the region art) with the van
  sprite driving on it, billboards scrolling past, weather plates layered. Middle: a thin strip
  of **yellow caption boxes** carrying the status ("DAY 4 · MAY 4 · MILE 36 · $218.45 …") and a
  row of **crew headshots** in a panel (mood headshots swap with health). Bottom: the **choices
  as speech balloons** — each choice is a balloon with a tail from a crew member ("Drive on!",
  "Let's rest a day…", "Snack run?!"). Number keys still work.
- **Events** = a **three-panel strip** (the event art) with the sim's text lettered into
  balloons/captions over it, and the matching **SFX lettering slammed on** with a pop animation
  (BANG! for the tire, HISSSSS for the radiator, KRASHH for the grade). Choice events (storms,
  crossings, the summit) put the two options in two balloons from two crew members arguing.
- **Stops** = a postcard panel plus balloons; **the store** = the outfitter splash with the
  price list as a chalkboard and "KA-CHING!" on purchases.
- **The snack run** = a rapid-fire panel with the word to type in a shout balloon and CHOMP!
  on hits.
- **Deaths** = a full-page splash with a black border; the epitaph input is a caption box you
  type into. **Victory** = the Sunset Cliffs cliff-jump splash with HOORAY! lettering and the
  score in a caption stack.
- **Title** = **comic cover No. 1** with the masthead; "PRESS START" as a burst balloon.
- **Page transitions**: panels slide/tilt in; reduced-motion gets instant cuts.
- **Lettering**: Bangers (SFX, titles), Luckiest Guy (masthead), Comic Neue (balloons, body).
  All Google Fonts. Balloons, captions, panel borders, halftone, and bursts are **CSS/SVG**
  (never baked into art) so text stays live and translatable.
- Both themes share the sim and the Screen model. `src/sim/` does not change for the look.

## Engineering shape

- Replace `src/ui/coastal*` (or whatever Phase 2 named it) with `src/ui/comic/`: a page
  compositor (panels), a balloon/caption layer, an SFX layer, an asset registry with SVG
  placeholders for every slot in ASSET-LIST.md (`public/assets/...`), lazy-loaded region art.
- Theme toggle keeps its storage key (`8wt.theme.v1`); values become `heritage` | `comic`
  (migrate `coastal` → `comic` on read).
- Placeholders first: the Comic renderer must look like a comic **with zero supplied assets**
  (ink-outlined SVG shapes, real balloons, real SFX lettering in web fonts). Frank's art then
  drops into slots.
- TDD as before: sim tests untouched; renderer logic (panel layout from Screen, balloon
  assignment, SFX mapping, asset fallback) gets unit tests; a Playwright playthrough verifies
  both themes before deploy.
- Bundle: first load < 2 MB; art lazy by region. Deploy exactly as Phase 1/2 to coastline:1985.

## Definition of done

- Every screen renders as a comic page in Comic theme; Heritage untouched; toggle persists.
- SFX lettering fires on the right events; choices are balloons; captions carry status.
- Asset registry covers every slot in ASSET-LIST.md with a placeholder; any supplied file
  replaces its placeholder with no code change.
- Cover No. 1 title screen; Sunset Cliffs cliff-jump victory splash.
- Tests green (sim + renderer), Playwright playthrough in both themes, deployed and verified
  at https://8wt.8westit.com.

## What shipped (2026-08-24)

- **Step A (PR #3):** theme ids `comic | heritage` (a stored `coastal` migrates); `view()` carries
  `scene` (src/sim/scene.ts: twelve establishing-shot regions by mile, van look, moving flag, stop and
  event ids) and `set` (structured numbers for the crossing, the grade, the snack run, the store, the
  grave, the victory) — presentation data only, rules and RNG untouched; pool events name themselves.
  Asset registry (src/ui/assets.ts): every slot in ASSET-LIST.md as a bare base path, any accepted
  format, vector master first; the manifest is scanned from public/assets/ at build time.
- **Step B (PR #4):** src/ui/comic/ — `layout.ts` (Screen → ComicPage), `balloons.ts` (choices →
  balloons from living crew, utilities → guide signs, crew cast by name onto the twelve characters),
  `sfx.ts` (event → word; KA-CHING on a real purchase, ZZZ on rest, CHOMP on a snack hit, SCREEECH when
  the brakes start smoking, VROOOM leaving the outfitter, SPLOOSH fording, WAH-WAAAH at the grave,
  HOORAY at the cliffs), `placeholders.ts` + `art-*.ts` (inked SVG for every slot: twelve regions,
  the van in eleven poses, twelve crew × five moods, 27 three-frame strips, nine splashes, the cover,
  postcards, billboards lettered in-engine, SFX bursts, signage), `page.ts` (DOM), `index.ts`
  (renderer), `comic.css`. Fonts load only when the comic mounts; `brand/icon` becomes the favicon.
- **Verification:** 296 vitest tests (51 for the page engine); `npm run e2e` plays both themes
  against the production build; every page kind reviewed by screenshot at desktop and phone widths.
  First load of the comic cover ≈ 0.6 MB + fonts.
- **Art pipeline:** `npm run art` writes a WebP sibling for any raster over 200 KB (Claude Imagine
  saves ~1 MB JPEGs under .png names); the registry prefers the .webp, so that is what ships. A raw
  masthead sheet is not used in the header — only an SVG masthead replaces the lettering.
- **Not done / deferred:** night region plates and weather art are placeholders only; the snack run
  uses the snack-stand strip frames. Audio landed 2026-08-25: `src/ui/comic/audio.ts` plans music / ambience / engine / one-shots per screen transition, `src/ui/comic/mixer.ts` plays them (Web Audio, gapless loops, crossfades, SOUND: ON/OFF in the masthead); video slots still play nothing.

## Working rules (Frank's global CLAUDE.md)

- Investigate and propose at low effort; **announce "ready to code — raise effort" and stop**
  before writing code. End every reply with the recommended next effort level. Cheap models for
  fan-outs; frontier model for code and judgment.
