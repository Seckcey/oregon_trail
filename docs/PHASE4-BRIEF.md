# Phase 4 Brief — The Trail Remembers

*Seeded 2026-08-25 by the lead. Read after README.md, docs/PLAN.md, and docs/PHASE3-COMIC-BRIEF.md.
This is a PLANNING brief: the session that picks it up designs and proposes; no code until Phase 3
(the comic renderer) has merged and deployed.*

## The idea

The 1985 original saved your tombstone to the floppy for the next kid. Phase 1 kept that in
localStorage. Phase 4 makes it **networked**: real players' roadside memorials at the mile
where they fell, a leaderboard for the runs that made Sunset Cliffs, and share cards — all of
it the marketing funnel for 8 West IT 365 on 8westit.com.

## What exists

- A static game (Vite bundle) served by nginx in a Docker container on coastline,
  `127.0.0.1:1985`, published as https://8wt.8westit.com through a remotely-managed
  Cloudflare tunnel. No backend at all today.
- The sim is pure: `createGame(seed, memorials)` already takes a list of memorials and passes
  them by the roadside at the right mile; deaths accumulate in `state.runMemorials` and the UI
  persists them to localStorage (`src/ui/persistence.ts`). Victory produces a score breakdown
  (`computeScore`). The share text is built in `src/main.ts`.
- Both themes render from the same Screen model; a leaderboard screen would be a new
  phase/screen in `view()` fed by data the UI layer fetched — the sim never calls a network.

## Scope to design

1. **Memorials service** — POST a memorial at death (names, mile, cause, epitaph, day), GET
   memorials for a run (a sample along the route, not all of them), served fast and cached.
2. **Leaderboard** — POST a finished run (score, occupation, days, survivors, summit route,
   celebration), GET the top N and the player's rank. **Optional** email to claim a spot, with
   explicit consent copy; this is the lead list.
3. **Share cards** — a per-run OG image (the van, the score or the cause of death, the link)
   so a shared run unfurls in Slack/Teams/texts. Possibly a Worker rendering SVG→PNG.
4. **The funnel** — where the 8 West IT 365 call-to-action sits (score screen, leaderboard,
   memorial page), and a privacy-respecting analytics choice (Cloudflare Web Analytics or
   Plausible; no cookies).

## Decisions the plan must make (with a recommendation each)

- **Where the backend runs.** (a) A small Node service (Hono/Fastify) in a second container on
  coastline with SQLite or one of the Postgres instances already there, proxied by nginx under
  `/api/`; or (b) Cloudflare Workers + D1/KV at the edge, zero load on coastline, free tier,
  already inside the Cloudflare account that owns the tunnel. Weigh ops burden, latency, and
  Frank's ability to see the data.
- **Abuse and moderation.** Epitaphs are player text shown to strangers: length caps, a
  profanity/slur filter, a hide/report path, rate limiting, and Cloudflare Turnstile against
  bots. Decide what is automatic and what Frank reviews.
- **Privacy.** Kids play this. Emails are optional, consent is explicit and plain, there is a
  one-click unsubscribe, a short privacy note on the site, and no email is ever shown or
  required. Store the minimum; hash IPs for rate limiting; state a retention period.
- **Identity without accounts.** No logins. A display name (filtered), an optional email, and
  a client-generated run id. Decide how the player's own rank is shown back to them.
- **Rollout.** Feature-flag the network layer so the game keeps working fully offline; ship
  memorials first (lowest risk, most delight), leaderboard second, share cards third.

## Constraints that do not move

- The sim stays pure and tested; network I/O lives in the UI layer only.
- Both themes keep working; Heritage stays untouched visually.
- Site copy never prints "Oregon Trail". Kannon's Type 1 rules in docs/PLAN.md are not
  optional.
- Deploy the same way as Phases 1–3 (README recipe), and verify at https://8wt.8westit.com.

## Deliverable of the planning session

`docs/PHASE4-PLAN.md`: the chosen architecture with the reasons, the data model, the API
surface, the moderation and privacy rules in the exact words the site will use, the rollout
order, and a build plan with tests — then stop and wait for Frank to raise effort.
