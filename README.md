# The 8 West Trail

A browser game for [8westit.com](https://8westit.com) — everything you loved about The Oregon
Trail, pointed at the beach. Load the van in Las Cruces, survive the desert, the dunes, and the
6% grade, and don't stop until Interstate 8 dead-ends at the Pacific.

Built by **8 West Ventures, LLC** as a marketing tool for **8 West IT 365**: the company is named
for the highway, and now the highway is the game. Free to play, embedded on the website, designed
to be shared. Everyone who plays it will know exactly what game it's tipping its hat to.

The ending screens connect the joke to the product without interrupting the game: Comic and
Heritage both pair **Run it again** with **See the real workflow**, and the latter opens
`8westit.com/trail/#workflow` with one of three bounded surfaces (`victory`, `dead`, or
`leaderboard`). It preserves only valid incoming campaign fields (`utm_id`, `utm_source`,
`utm_medium`, `utm_campaign`, `utm_source_platform`, `utm_term`, and `utm_content`) and supplies fixed defaults
when they are absent. The bridge never puts player-entered text, a seed, or a referrer in a URL or
analytics event.

## Status

**Phase 3 is live at [8wt.8westit.com](https://8wt.8westit.com)** — the comic-book edition. The
default look is a Saturday-morning mystery comic, and the interface is the comic page: an
establishing shot with the van driving through it and 8 West IT billboards riding past, yellow
caption boxes for status, crew headshots that change with health, choices as speech balloons from
the crew, events as tilted three-panel strips with SFX lettering slammed on (BANG!, HISSSSS, KRASHH,
KA-CHING!, HOORAY!), Cover No. 1 as the title screen, and the Sunset Cliffs cliff-jump splash. It
draws itself with inked SVG placeholders for every slot in [docs/ASSET-LIST.md](docs/ASSET-LIST.md);
real art dropped into [public/assets/](public/assets/README.md) replaces a placeholder with no code
change. The green-phosphor **Heritage** look is untouched on the other side of the toggle.

**Phase 4B — the leaderboard and the list — is built (2026-08-25), awaiting its deploy.** A run
that makes the cliffs is posted to the API (idempotent on its run id); the claim screens put a
nickname on the board, then optionally an email with an explicit 18+ consent sentence (stored
verbatim) — the lead list Frank exports with `admin.mjs leads.csv`; every email has a one-click
unsubscribe at `/unsubscribe/<token>`. The board shows the top 25 and, from the same browser,
where your run landed. Skippable at every step; offline it says so.

**Phase 4A — the trail remembers — is live (2026-08-25).** Roadside memorials are
networked: when a crew dies online, the memorial (nicknames, mile, cause, epitaph) is posted to a
small API in a second container (`server/`: Node 26 + Hono + `node:sqlite`, proxied by nginx under
`/api/`), filtered for contact details and rude words, rate-limited, and gated by Cloudflare
Turnstile; every new game fetches a route-wide sample so strangers' memorials stand at the mile
where they fell, and anyone can report one from the road (two reports hide it for Frank's review
from `admin.mjs`). The game is whole with the API absent — `?offline=1` at runtime, or an empty
`VITE_8WT_API` at build time. The privacy note lives in About and at `/privacy`; GA4 stays off
until the player accepts the small analytics notice, then receives only allowlisted outcomes and
numbers — never names, emails, or epitaphs. `?offline=1` loads neither GA4 nor Turnstile.
See [docs/PHASE4-PLAN.md](docs/PHASE4-PLAN.md).
Underneath is everything from Phase 2 (the full route, the crossings, the dunes, the In-Ko-Pah, the
Laguna Summit decision and the 6% grade, tune-ups, landmark specials) and Phase 1 (outfitting,
pace/rations/water, storms, breakdowns, the snack run, deaths and roadside memorials, scoring,
localStorage saves).

See [docs/PLAN.md](docs/PLAN.md) for the full game design and build plan, and
[research/](research/) for the underlying research (history, mechanics, market).

## Development

```
npm install
npm run dev      # local dev server (no API: VITE_8WT_API is empty, the game plays offline)
npm test         # 431 tests (vitest): sim, route, crossings, the grade, scene + set pieces, the comic page engine, the net layer
npm run test:server  # 126 tests for the API (server/), against :memory: SQLite
npm run test:all # both
npm run build    # typecheck + production bundle in dist/
npm run e2e      # Playwright: the playthrough in both themes, the mocked API, ?offline=1, the API down
npm run art      # WebP siblings for any raster in public/assets/ over 200 KB (the small file ships)
npm run shared   # regenerate shared/limits.json from the sim (the API validates against it)
```

To run the game against a local API: `cd server && npm install && npm run dev` (port 3000, no
secrets needed — Turnstile is skipped with a warning), then `VITE_8WT_API=http://localhost:3000/api
npm run dev`.

Art goes in `public/assets/<category>/<name>.<ext>` under the names in
[docs/ASSET-LIST.md](docs/ASSET-LIST.md) — see [public/assets/README.md](public/assets/README.md).
Any accepted format works; an SVG master beats a WebP beats a PNG in the same slot.

The simulation (`src/sim/`) is pure, deterministic, and fully tested — seeded RNG, no DOM.
The UI (`src/ui/`, `src/main.ts`) renders the sim's Screen model and forwards input: one sim, one
Screen, one renderer per theme (`src/ui/comic/`, `src/ui/heritage/`) behind `src/ui/renderer.ts`.

## Deploy (coastline)

The VM builds and serves the game with Docker on `127.0.0.1:1985`, which the Cloudflare
tunnel maps to 8wt.8westit.com. Since Phase 4 there are two containers: nginx with the static
game, and `eight-west-api` (no published port; nginx proxies `/api/`) with its SQLite file in
`~/apps/eight-west-trail/data/8wt.db`. Secrets (`TURNSTILE_SECRET`, `IP_HASH_SECRET`) live in
`~/apps/eight-west-trail/.env` — see `.env.example`; the public keys are build args in
`docker-compose.yml`.

```
npm test && npm run build            # typecheck + suite, from a clean git tree
git archive --format=tar.gz -o /tmp/8wt-deploy.tar.gz HEAD
scp /tmp/8wt-deploy.tar.gz coastline:/tmp/8wt-deploy.tar.gz
ssh coastline "tar xzf /tmp/8wt-deploy.tar.gz -C ~/apps/eight-west-trail && cd ~/apps/eight-west-trail && docker compose up -d --build"
```

**Never `rm -rf` the app directory before extracting** — `data/` (the live memorial database) and
`.env` (the secrets) live there and are not in git. Extract over the tree; Docker rebuilds the rest.

Because the tree is extracted over rather than replaced, a file that leaves git stays on the box.
That is why the image **builds without typechecking** (`npx vite build`) and `.dockerignore` keeps
`test/`, `e2e/` and `scripts/` out of the build context: one leftover file must never fail a
deploy it has nothing to do with. Unimported leftovers under `src/` are tree-shaken away. The
authoritative typecheck is the `npm test && npm run build` line above, run from the git tree —
don't skip it.

Frank's review queue, from the box:

```
docker compose exec eight-west-api node admin.mjs queue        # hidden memorials + their reports
docker compose exec eight-west-api node admin.mjs ok <id>      # false positive: show it again
docker compose exec eight-west-api node admin.mjs remove <id>  # take it down for good
docker compose exec eight-west-api node admin.mjs leads.csv    # the list (consented, minus unsubscribed)
sqlite3 data/8wt.db                                            # everything else
```

## Repo layout

- `docs/PLAN.md` — game design + build plan (the source of truth)
- `docs/PHASE3-COMIC-BRIEF.md` — the comic-book edition: what the Comic renderer is and how it is built
- `docs/PHASE4-PLAN.md` — the trail remembers: architecture, data model, API, moderation, privacy, the build plan
- `server/` — the API (Hono, `node:sqlite`, the filter, the sampler, `admin.mjs`); `shared/limits.json` — what the sim tells it
- `src/ui/net/` — the only code that knows a network exists; `src/ui/session.ts` — the UI's side effects around the sim
- `docs/ASSET-LIST.md` — every art slot with a ready-to-paste generation prompt
- `src/sim/` — the deterministic simulation; `src/ui/comic/` and `src/ui/heritage/` — the two renderers
- `public/assets/` — the art drop zone (placeholders fill every empty slot)
- `e2e/` — the Playwright playthrough; `scripts/` — the art optimizer and the QA state writer
- `research/` — Oregon Trail research: history, 1985 mechanics deep-dive, market context
