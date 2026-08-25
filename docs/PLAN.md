# The 8 West Trail — Game Design & Build Plan

*8 West Ventures, LLC — updated 2026-08-24. Supersedes the earlier "Westering" premium-indie
concept: the game is now a free browser marketing tool for 8 West IT 365 on 8westit.com.*

## The concept

A faithful, loving reskin of the classic 1985 Oregon Trail loop, transplanted from the 1848
emigrant trail to the 8 West run to the beach. Same bones — outfitting, pace vs. rations,
crossings, breakdowns, random catastrophe, permadeath, epitaphs, a score table — new skin:
a five-person crew in a van, desert heat instead of blizzards, the Colorado River at Yuma
instead of the Green River, and the run ending where Interstate 8 literally dead-ends at the
Pacific at Sunset Cliffs, San Diego — where the crew celebrates by jumping off the cliffs.

The homage is the point. Everyone who plays it should smile in the first 30 seconds because
they know exactly what game this is — and remember which IT company made it.

## Two facts to sign off on

1. **Geography.** Interstate 8 actually runs from Casa Grande, Arizona to San Diego (~350 mi);
   it never enters New Mexico. The road that *did* run New Mexico → San Diego is **Historic US
   Route 80**, which I-8 replaced in the west. This is a marketing gift, not a problem: "the 8
   was the 80" gives us the full Las Cruces → beach run (~730 mi, the drive everyone actually
   does via I-10 → I-8), and "Historic 80 / 8 West" flavor for free. The plan assumes the full
   Las Cruces start; trimming to the pure I-8 corridor (Casa Grande start) is a config change.
2. **Trademark.** "The Oregon Trail" is a live, actively defended trademark (The Learning
   Company / HMH — they sued Zynga over *FrontierVille*). The game being an obvious homage is
   fine (Organ Trail, Death Road to Canada). The rule is for **our marketing copy**: the website
   should wink — "the trail game you played on the school Apple II" — and never use the words
   "Oregon Trail" or their assets in ads, meta tags, or page copy. The game content itself uses
   only our own names, art, and text.

## The route (17 stops, mirroring the 1985 cadence)

| # | Stop | Type | 1985 analog |
|---|------|------|-------------|
| 1 | Las Cruces, NM — outfitting | start | Independence / Matt's General Store |
| 2 | Deming, NM | resupply | Kansas River area |
| 3 | Lordsburg, NM | resupply | Big Blue |
| 4 | Texas Canyon, AZ | landmark | — |
| 5 | Tucson, AZ | resupply | Fort Kearney |
| 6 | Picacho Peak | landmark | Chimney Rock |
| 7 | Casa Grande — junction onto I-8 | resupply | Fort Laramie |
| 8 | Gila Bend (+ Gila River) | resupply/crossing | Independence Rock |
| 9 | Dateland (date shakes) | landmark | South Pass |
| 10 | Yuma — **Colorado River crossing** | crossing | Green River crossing |
| 11 | Felicity / Center of the World | landmark | Soda Springs |
| 12 | Imperial Sand Dunes | hazard | Snake River country |
| 13 | El Centro (below sea level) | resupply | Fort Hall |
| 14 | Ocotillo → In-Ko-Pah grade | hazard | Blue Mountains approach |
| 15 | Jacumba / Boulevard | landmark | Fort Boise |
| 16 | Laguna Summit (~4,000 ft) → the 6% grade | climax | The Dalles decision |
| 17 | El Cajon → Mission Valley → **Sunset Cliffs** (the cliff-jump finale; changed from Ocean Beach 2026-08-24) | finish | Oregon City |

**The climax (The Dalles analog):** at Laguna Summit, choose — **ride the 6% grade** (fast,
free, brakes smoking, runaway-ramp minigame) or **Old Highway 80** (slow winding backroad,
weather and time risk). Both fully produced; the choice is the crescendo, fixing the original's
famously anticlimactic Columbia raft.

## Mechanics translation (the game is essentially the same)

| 1985 | 8 West |
|------|--------|
| Occupation: banker ×1 / carpenter ×2 / farmer ×3 | CEO ×1 / sysadmin ×2 / intern ×3 — same cash spread, same score multipliers (harder start, bigger score) |
| Five-person wagon party | Five-person road crew (you name them) |
| Oxen | The van — engine, tires, radiator condition |
| Matt's General Store | The outfitter: food, water, gas money, spare parts (tire, belt, radiator hose ↔ wheel, axle, tongue) |
| Clothing (cold protection) | Water & sunscreen (heat protection) — the desert inverts the hazard |
| Pace: steady / strenuous / grueling | Same, as driving hours per day |
| Rations: filling / meager / bare-bones | Same |
| River crossings: ford / caulk / ferry / wait | Crossings & hazards: the Colorado at Yuma, flash-flood washes, dune wind closures — chance it / detour / pay / wait |
| Hunting minigame + 100 lb carry cap | The snack run: arcade minigame at roadside spots; "you grabbed 1,247 lbs of carne asada but could only carry 100 lbs back to the van" |
| Dysentery, cholera, snakebite… | Gas-station sushi, heatstroke, rattlesnake at the rest stop, flat tire, radiator boil-over, speed trap, ransomware on the work laptop… |
| "You have died of dysentery." | "You have died of gas-station sushi." |
| Tombstones saved to the floppy disk | Roadside memorials: real players' epitaphs appear at the mile marker where they died — the networked graveyard, our signature feature |
| Oregon Top Ten | The 8 West leaderboard (optional email capture → the marketing funnel) |

Design fixes carried over from the research (see research/02-mechanics.md): money buys comfort
not immunity (CEO can't buy his way out of heatstroke); snack-run carry cap keeps the food
economy honest; a real barter/price drift at stops; departure month/season genuinely reshapes
the run (desert heat curve instead of snowline).

**The IT 365 wink (light touch):** a handful of events tie to the brand without turning the
game into an ad — e.g. the ransomware event costs a day, with a one-liner: *"8 West IT 365
customers would've been fine."* One tasteful CTA on the death/score screen. That's it. The
game earns shares by being good; the brand rides along.

## Why this works as marketing

- **Borrowed equity:** the original sold 65M+ copies and was in 1 of 3 U.S. school districts by
  1989; the "Oregon Trail generation" (now 40–55) is exactly the demographic that owns and runs
  the businesses 8 West IT sells to.
- **Dwell + shares:** runs are 10–20 minutes in browser; every run auto-writes a shareable trail
  diary / score card ("I died of gas-station sushi outside Dateland — beat my run"), each share
  carrying the 8westit.com link.
- **The name does the work:** company named for the highway; game named for the highway. One
  joke, told twice, remembered forever.
- **Leaderboard = funnel:** optional email to claim a leaderboard spot; roadside memorials make
  every death land on a real mile of the brand's highway.

## Build status

- **Phase 1: SHIPPED 2026-08-24.** Live at https://8wt.8westit.com (coastline:1985 via the
  Cloudflare tunnel). Deterministic TypeScript sim core (103 vitest tests, built TDD),
  phosphor-terminal UI, localStorage saves and local roadside memorials, share-your-story copy.
  Note one deliberate deviation from the table above: the ransomware event costs $185 for
  "a guy who knows computers" instead of a lost day (cleaner in the sim), wink intact.
- **Phase 2 (the route): SHIPPED 2026-08-24.** PR #1 split the UI behind a renderer interface
  with a persisted theme toggle (Heritage pixel-identical); PR #2 opened the whole road — Gila and
  Colorado crossings, the Imperial Dunes, the In-Ko-Pah, the Laguna Summit decision with the 6%
  grade brake minigame vs Old Highway 80, tune-ups, landmark specials, and the finish moved to
  **Sunset Cliffs** with the cliff-jump celebration (Frank's call). 212 tests. The Phase 2 brief's
  "Coastal" theme was built to a first cut and then **cancelled the same day** in favour of the
  comic-book direction (docs/PHASE3-COMIC-BRIEF.md); that work is parked on an unpushed local
  branch, not merged.
- **Phase 3 (the comic-book edition): SHIPPED 2026-08-24.** PR #3 put a scene hint and set-piece
  numbers into `view()` and built the asset registry; PR #4 replaced the cancelled Coastal theme with
  the **Comic** renderer (`src/ui/comic/`): every screen is a comic page — establishing shots with the
  van and 8 West IT billboards, caption-box status, crew headshots by health, balloons from the crew,
  tilted three-panel event strips with SFX lettering, Cover No. 1, the cliff-jump splash — drawn with
  inked SVG placeholders for every slot in docs/ASSET-LIST.md until real art lands in public/assets/.
  296 vitest tests plus a Playwright playthrough in both themes (`npm run e2e`). Heritage untouched.
- **Kannon and Type 1 awareness: SHIPPED 2026-08-24 (PR #5).** See the section below; 14 tests.
- **Art pipeline: SHIPPED 2026-08-25 (PR #6).** `npm run art` keys the neon-green screen out of
  every cutout (flood fill from the border, sealed pockets, a window mode for the dashboard) and
  writes the `.webp` the registry prefers; `--root` targets another checkout's assets. 11 tests.
- **Real art: COMPLETE 2026-08-25.** Every image and video slot in docs/ASSET-LIST.md is filled —
  231 keyed `.webp`/`.svg` files plus the videos, all live. Brand and covers; the van in eleven
  poses and the dashboard; twelve crew as model sheets, headshots, two mood variants and pose
  sheets, plus both group shots; twelve road backdrops with two night plates; three weather
  plates; all seventeen stop postcards with clean plates; the sixteen SFX words; eight billboards
  with the blank plate, the parent-company winks and the twelve-piece signage kit; twenty-eight
  event strips; nine splashes; furniture, icons and the Heritage extras; covers 2–5; the 6s intro
  sting and the 10s billboard loop. Masters stay out of git (`art-masters/`); `npm run art` keys
  the green screen and slims oversized files. **Still open** (see ASSET-LIST §20): §15 audio,
  which was never in the image tool's scope; the §19.4 heat-shimmer plate; and a few images
  carrying a Ford badge on the van grille that wants painting out.
- **Phase 4 (the trail remembers): 4A SHIPPED 2026-08-25 (PR #9).** docs/PHASE4-PLAN.md
  is the plan (PR #8). Step 4A — networked roadside memorials — is on branch `phase4/memorials`:
  the `server/` API (Hono, `node:sqlite`, the text filter and word list, the route-wide sampler,
  reports, rate limits, Turnstile, the 30-day IP-hash purge, `admin.mjs`), the compose + nginx
  wiring, `src/ui/net/` and `src/ui/session.ts` in the game, the report Screen and the §6 copy in
  the sim, the privacy note at `/privacy`, GA4. 391 + 95 tests, Playwright with the API mocked,
  offline, and down. 4B (leaderboard + leads) and 4C (share cards) follow.

## Build plan

Tech: **TypeScript, deterministic simulation core with seeded RNG** (replayable, testable),
presentation layer separate — ships as a self-contained static bundle embeddable on 8westit.com
(no engine, no server required until Phase 4). Heritage Mode (green-phosphor filter + type-BANG
snack run) is a shader and a font.

1. **Vertical slice — Las Cruces to Tucson.** Sim core + text-forward UI: outfitting, pace/
   rations/water, first hazard, first snack run, first roadside memorial. Playable end to end.
2. **The full route.** All 17 stops, crew-as-characters, price drift, scoring, the Laguna
   Summit climax, death screens and epitaphs.
3. **Dress and wink.** Art direction (letterpress-meets-phosphor, matching the prospectus),
   sound, the shareable diary, Heritage Mode, 8 West IT 365 tie-in copy, embed on 8westit.com.
4. **The trail remembers.** Small persistence service: shared roadside memorials (4A) + leaderboard
   with email capture (4B) + share cards (4C). Network I/O lives in `src/ui/` only; the sim takes
   memorials in and reports deaths out, and never fetches.

## Deployment

- **Host:** `coastline` VM (Ubuntu, Docker-based — everything on the box runs as a container).
- **Port:** `1985` — free on coastline as of 2026-08-24, chosen for the year of the classic
  Apple IIe edition. The game ships as a static bundle in a container mapped to
  `127.0.0.1:1985 -> 80`.
- **Public URL:** `8wt.8westit.com`, via the existing remotely-managed Cloudflare tunnel
  (`cloudflared.service`, token-based). Frank adds the ingress rule in the Cloudflare Zero
  Trust dashboard: `8wt.8westit.com -> http://localhost:1985`.
- Approved 2026-08-24: the Las Cruces start / "the 8 was the 80" geography framing, and the
  homage-with-our-own-name trademark posture (gameplay unmistakably Oregon Trail; their mark
  never printed in our marketing).

## Kannon and Type 1 awareness (added 2026-08-24)

Kannon — Frank's son, drawn from life in `crew/07-model.png` — rides with the crew and lives
with Type 1 diabetes. The design rules, in priority order:

1. **T1D never kills him in this game.** The road can, the same as anyone (sushi, thirst, the
   river). His diabetes is something he *manages*, and the game shows him managing it.
2. **He's always offered.** Every new game's five suggested names include Kannon (his slot in
   the line-up is the seed's choice). Players can rename him away; then none of this fires.
   The sim recognises him by name (`isKannon`), case-insensitive.
3. **The Dexcom alert** (`dexcom-low`, once per run, ~12%/driving day after mile 20): his CGM
   says LOW. Two balloons — *Pull over. Juice box and fifteen minutes.* (lose ~10 miles, then
   the **rule of 15** caption) or *He says he's fine. Keep rolling.* (he loses 5 health, never
   below 1; the crew loses ~25 miles; then the lesson: the alert is the whole point). In the
   comic, "keep rolling" is Kannon's balloon and "pull over" is someone else's.
4. **Small touches:** on scorching days, once, the insulin goes in the cooler (`insulin-cooler`);
   a good snack run notes that he counts the carbs and doses without looking up; the crew panel
   shows the **blue circle** beside his name, and tapping it opens a note with both links.
5. **Links, always both:** American Diabetes Association (diabetes.org) and Breakthrough T1D,
   formerly JDRF (breakthrought1d.org) — in the lesson captions, the crew-panel note, and About.

Medical copy follows the ADA's hypoglycemia guidance (15 g fast-acting carbs, recheck in
15 minutes, repeat) and the CDC's description of Type 1 (autoimmune; the pancreas makes little
or no insulin). Everything lives in `src/sim/t1d.ts`; tests in `test/kannon.test.ts`.

## Reference

- docs/PHASE2-BRIEF.md — Phase 2 scope (two themes + toggle, branding, full route)
- docs/PHASE3-COMIC-BRIEF.md — Phase 3: the comic-book edition (what shipped, and how it is built)
- docs/ASSET-LIST.md — every art slot with a ready-to-paste generation prompt
- research/01-history.md — franchise history, IP ownership
- research/02-mechanics.md — full 1985 mechanical teardown (the spec we're reskinning)
- research/03-market.md — remakes, comps, representation lessons
- Pitch prospectus artifact: https://claude.ai/code/artifact/7f6ea143-9231-4f69-a04d-4273c6cfac2a
