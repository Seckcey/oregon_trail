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
Underneath is everything from Phase 2 (the full route, the crossings, the dunes, the In-Ko-Pah, the
Laguna Summit decision and the 6% grade, tune-ups, landmark specials) and Phase 1 (outfitting,
pace/rations/water, storms, breakdowns, the snack run, deaths and roadside memorials, scoring,
localStorage saves). Phase 4 is networked memorials.

See [docs/PLAN.md](docs/PLAN.md) for the full game design and build plan, and
[research/](research/) for the underlying research (history, mechanics, market).

## Development

```
npm install
npm run dev      # local dev server
npm test         # 296 tests (vitest): sim, route, crossings, the grade, scene + set pieces, the comic page engine
npm run build    # typecheck + production bundle in dist/
npm run e2e      # Playwright playthrough in both themes against the production build
npm run art      # WebP siblings for any raster in public/assets/ over 200 KB (the small file ships)
```

Art goes in `public/assets/<category>/<name>.<ext>` under the names in
[docs/ASSET-LIST.md](docs/ASSET-LIST.md) — see [public/assets/README.md](public/assets/README.md).
Any accepted format works; an SVG master beats a WebP beats a PNG in the same slot.

The simulation (`src/sim/`) is pure, deterministic, and fully tested — seeded RNG, no DOM.
The UI (`src/ui/`, `src/main.ts`) renders the sim's Screen model and forwards input: one sim, one
Screen, one renderer per theme (`src/ui/comic/`, `src/ui/heritage/`) behind `src/ui/renderer.ts`.

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
- `docs/PHASE3-COMIC-BRIEF.md` — the comic-book edition: what the Comic renderer is and how it is built
- `docs/ASSET-LIST.md` — every art slot with a ready-to-paste generation prompt
- `src/sim/` — the deterministic simulation; `src/ui/comic/` and `src/ui/heritage/` — the two renderers
- `public/assets/` — the art drop zone (placeholders fill every empty slot)
- `e2e/` — the Playwright playthrough; `scripts/` — the art optimizer and the QA state writer
- `research/` — Oregon Trail research: history, 1985 mechanics deep-dive, market context
