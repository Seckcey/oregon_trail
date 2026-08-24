# The 8 West Trail

A browser game for [8westit.com](https://8westit.com) — everything you loved about The Oregon
Trail, pointed at the beach. Load the van in Las Cruces, survive the desert, the dunes, and the
6% grade, and don't stop until Interstate 8 dead-ends at the Pacific.

Built by **8 West Ventures, LLC** as a marketing tool for **8 West IT 365**: the company is named
for the highway, and now the highway is the game. Free to play, embedded on the website, designed
to be shared. Everyone who plays it will know exactly what game it's tipping its hat to.

## Status

**Phase 2 is live at [8wt.8westit.com](https://8wt.8westit.com)** — the full route, Las Cruces
to Sunset Cliffs: seventeen stops, the Gila and Colorado crossings (ford / float / ferry / wait),
the Imperial Dunes, the In-Ko-Pah climb, the Laguna Summit decision and the 6% grade, shop
tune-ups, landmark specials, and the cliff-jump finish — plus everything from Phase 1
(outfitting, pace/rations/water, storms, breakdowns, the snack run, deaths and roadside
memorials, scoring, localStorage saves). It ships in the green-phosphor **Heritage** look; the
UI is split behind a renderer interface with a persisted theme toggle ready for a second theme.
Phase 3 is the comic-book renderer (see [docs/PHASE3-COMIC-BRIEF.md](docs/PHASE3-COMIC-BRIEF.md));
Phase 4 is networked memorials.

See [docs/PLAN.md](docs/PLAN.md) for the full game design and build plan, and
[research/](research/) for the underlying research (history, mechanics, market).

## Development

```
npm install
npm run dev      # local dev server
npm test         # 244 tests (vitest): sim, route, crossings, the grade, scene + set pieces, UI plumbing
npm run build    # typecheck + production bundle in dist/
```

The simulation (`src/sim/`) is pure, deterministic, and fully tested — seeded RNG, no DOM.
The UI (`src/ui/`, `src/main.ts`) renders the sim's Screen model and forwards input.

## Deploy (coastline)

The VM builds and serves the game with Docker on `127.0.0.1:1985`, which the Cloudflare
tunnel maps to 8wt.8westit.com:

```
git archive --format=tar.gz -o /tmp/8wt-deploy.tar.gz HEAD
scp /tmp/8wt-deploy.tar.gz coastline:/tmp/8wt-deploy.tar.gz
ssh coastline "tar xzf /tmp/8wt-deploy.tar.gz -C ~/apps/eight-west-trail && cd ~/apps/eight-west-trail && docker compose up -d --build"
```

## Repo layout

- `docs/PLAN.md` — game design + build plan (the source of truth)
- `research/` — Oregon Trail research: history, 1985 mechanics deep-dive, market context
