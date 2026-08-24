# The 8 West Trail — Game Design & Build Plan

*8 West Ventures, LLC — updated 2026-08-24. Supersedes the earlier "Westering" premium-indie
concept: the game is now a free browser marketing tool for 8 West IT 365 on 8westit.com.*

## The concept

A faithful, loving reskin of the classic 1985 Oregon Trail loop, transplanted from the 1848
emigrant trail to the 8 West run to the beach. Same bones — outfitting, pace vs. rations,
crossings, breakdowns, random catastrophe, permadeath, epitaphs, a score table — new skin:
a five-person crew in a van, desert heat instead of blizzards, the Colorado River at Yuma
instead of the Green River, and the run ending where Interstate 8 literally dead-ends at the
Pacific in Ocean Beach, San Diego.

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
| 17 | El Cajon → Mission Valley → **Ocean Beach** | finish | Oregon City |

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
4. **The trail remembers.** Small persistence service: shared roadside memorials + leaderboard
   with email capture.

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

## Reference

- research/01-history.md — franchise history, IP ownership
- research/02-mechanics.md — full 1985 mechanical teardown (the spec we're reskinning)
- research/03-market.md — remakes, comps, representation lessons
- Pitch prospectus artifact: https://claude.ai/code/artifact/7f6ea143-9231-4f69-a04d-4273c6cfac2a
