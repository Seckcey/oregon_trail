# The 8 West Trail

A browser game for [8westit.com](https://8westit.com) — everything you loved about The Oregon
Trail, pointed at the beach. Load the van in Las Cruces, survive the desert, the dunes, and the
6% grade, and don't stop until Interstate 8 dead-ends at the Pacific.

Built by **8 West Ventures, LLC** as a marketing tool for **8 West IT 365**: the company is named
for the highway, and now the highway is the game. Free to play, embedded on the website, designed
to be shared. Everyone who plays it will know exactly what game it's tipping its hat to.

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

**Phase 4A — the trail remembers — is live (2026-08-25).** Roadside memorials are
networked: when a crew dies online, the memorial (nicknames, mile, cause, epitaph) is posted to a
small API in a second container (`server/`: Node 26 + Hono + `node:sqlite`, proxied by nginx under
`/api/`), filtered for contact details and rude words, rate-limited, and gated by Cloudflare
Turnstile; every new game fetches a route-wide sample so strangers' memorials stand at the mile
where they fell, and anyone can report one from the road (two reports hide it for Frank's review
from `admin.mjs`). The game is whole with the API absent — `?offline=1` at runtime, or an empty
`VITE_8WT_API` at build time. The privacy note lives in About and at `/privacy`; GA4 counts visits.
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
npm test         # 391 tests (vitest): sim, route, crossings, the grade, scene + set pieces, the comic page engine, the net layer
npm run test:server  # 95 tests for the API (server/), against :memory: SQLite
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
git archive --format=tar.gz -o /tmp/8wt-deploy.tar.gz HEAD
scp /tmp/8wt-deploy.tar.gz coastline:/tmp/8wt-deploy.tar.gz
ssh coastline "tar xzf /tmp/8wt-deploy.tar.gz -C ~/apps/eight-west-trail && cd ~/apps/eight-west-trail && docker compose up -d --build"
```

Frank's review queue, from the box:

```
docker compose exec eight-west-api node admin.mjs queue        # hidden memorials + their reports
docker compose exec eight-west-api node admin.mjs ok <id>      # false positive: show it again
docker compose exec eight-west-api node admin.mjs remove <id>  # take it down for good
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
