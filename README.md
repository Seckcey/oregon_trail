# The 8 West Trail

A browser game for [8westit.com](https://8westit.com) — everything you loved about The Oregon
Trail, pointed at the beach. Load the van in Las Cruces, survive the desert, the dunes, and the
6% grade, and don't stop until Interstate 8 dead-ends at the Pacific.

Built by **8 West Ventures, LLC** as a marketing tool for **8 West IT 365**: the company is named
for the highway, and now the highway is the game. Free to play, embedded on the website, designed
to be shared. Everyone who plays it will know exactly what game it's tipping its hat to.

## Status

**Phase 1 is live at [8wt.8westit.com](https://8wt.8westit.com)** — the Desert Leg, Las Cruces
to Tucson: outfitting, pace/rations/water, dust storms and monsoons, breakdowns, the snack run,
deaths and roadside memorials, scoring, and localStorage saves. Phases 2-4 (the full route to
Ocean Beach, art pass, networked memorials) are next.

See [docs/PLAN.md](docs/PLAN.md) for the full game design and build plan, and
[research/](research/) for the underlying research (history, mechanics, market).

## Development

```
npm install
npm run dev      # local dev server
npm test         # 103 sim tests (vitest)
npm run build    # typecheck + production bundle in dist/
```

The simulation (`src/sim/`) is pure, deterministic, and fully tested — seeded RNG, no DOM.
The UI (`src/ui/`, `src/main.ts`) renders the sim's Screen model and forwards input.

## Deploy (coastline)

The VM builds and serves the game with Docker on `127.0.0.1:1985`, which the Cloudflare
tunnel maps to 8wt.8westit.com:

```
git archive --format=tar.gz -o /tmp/8wt.tar.gz HEAD
scp /tmp/8wt.tar.gz coastline:/tmp/
ssh coastline "tar xzf /tmp/8wt-deploy.tar.gz -C ~/apps/eight-west-trail && cd ~/apps/eight-west-trail && docker compose up -d --build"
```

## Repo layout

- `docs/PLAN.md` — game design + build plan (the source of truth)
- `research/` — Oregon Trail research: history, 1985 mechanics deep-dive, market context
