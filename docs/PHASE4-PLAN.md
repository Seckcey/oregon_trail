# Phase 4 Plan — The Trail Remembers

*Written 2026-08-25 on branch `phase4/plan`. Answers docs/PHASE4-BRIEF.md. Read after README.md,
docs/PLAN.md, and docs/PHASE3-COMIC-BRIEF.md. This is the plan; no code has been written.*

## Summary of the decisions

| Decision | Choice | One-line reason |
|---|---|---|
| Where the backend runs | **A second container on coastline** (Node 26 + Hono + `node:sqlite`), proxied by the game's nginx under `/api/` and `/r/` | Same deploy recipe, same box, one `sqlite3 data/8wt.db` away from Frank; Workers would split the app across two deploy pipelines for load we will never have |
| Moderation | **Automatic filter + shadow-hide + two-report auto-hide; Frank reviews the hidden queue from a CLI** | Nothing a stranger sees is unfiltered; nothing a player types teaches them how to beat the filter |
| Privacy | **No accounts, no cookies, no email required, 18+ for the email field, salted-and-rotated IP hashes purged at 30 days, Google Analytics 4 for visits** | The audience is the generation that played the original; the lead list is adults who run businesses, so the email field says so plainly |
| Identity | **Client-generated run id + a per-browser player token in localStorage; rank computed server-side and returned on POST** | No login, no PII, and the player still sees "you are #37" |
| Rollout | **4A memorials → 4B leaderboard + leads → 4C share cards**, every network call behind a flag, the game whole with the API down | Delight first, lead list second, unfurls third; nothing regresses the offline game |

## 1. Architecture

### 1.1 Why a container on coastline, not Workers

Both options work. The tie-breakers all point at coastline:

- **Frank can see the data.** The whole point of the leaderboard is the lead list. On coastline
  it is one SQLite file in a bind-mounted `data/` folder: `sqlite3 data/8wt.db 'select * from
  leads'`, `cp` for a backup, a CSV export script for the mailing tool. On D1 it is
  `wrangler d1 execute` from a laptop with a logged-in Cloudflare CLI, or the dashboard's query
  console. Not hard, but a second tool and a second login for a one-person shop.
- **One deploy, one repo, one recipe.** README's `git archive → scp → docker compose up -d
  --build` already ships the game; adding a second service to `docker-compose.yml` ships the
  API with the same three commands. Workers need `wrangler deploy`, a Cloudflare API token on
  whatever machine deploys, and a separate secrets store — a second pipeline to keep alive.
- **The tunnel already does the hard part.** `8wt.8westit.com → localhost:1985` is the only
  ingress rule; nginx proxies `/api/` and `/r/` to the API container on the compose network. No
  new DNS, no new tunnel rule, no CORS (same origin).
- **Load is a rounding error.** Traffic is one GET at game start, one POST at death or victory,
  one PNG per share. Cloudflare caches the GETs and the PNGs at the edge either way. coastline
  will not notice.
- **Latency is fine.** The GET happens once at `createGame` and is cached at the edge for five
  minutes; the POSTs happen on screens where the player is reading. Edge latency is a
  Workers advantage the game cannot feel.
- **Share cards want a real runtime.** Rendering SVG → PNG with bundled fonts is a two-line
  job in Node (`@resvg/resvg-js`); on Workers it is WASM plus a font-loading dance. Same
  container, same fonts, done.

**What we still take from Cloudflare:** Turnstile (bots) and the edge cache (GETs and card
PNGs). Both are dashboard toggles inside the account that
owns the tunnel; none of them cares where the origin lives.

**The escape hatch:** the API is a Hono app. Hono runs unchanged on Workers. If coastline ever
becomes the wrong home, the move is the storage adapter (SQLite → D1) and nothing else. That is
worth an interface boundary in the code (`server/src/db.ts`) and no more.

### 1.2 The pieces

```
browser ──── Cloudflare (Turnstile, edge cache) · Google Analytics 4 (visits)
                │  tunnel
                ▼
      coastline :1985  eight-west-trail (nginx, static game)
                │  /api/*  → http://eight-west-api:3000/api/*
                │  /r/*    → http://eight-west-api:3000/r/*
                ▼
      eight-west-api (Node 26, Hono, node:sqlite, resvg)
                │
                ▼
      ./data/8wt.db  (bind mount; Frank's sqlite3 prompt lives here)
```

- **`server/`** — a second package in the repo (`server/package.json`, own `Dockerfile`).
  Hono on `node:http`, `node:sqlite` (built into Node 22+; no native build on Alpine), a
  curated word list, `@resvg/resvg-js` for cards. One process; in-memory rate limiter; WAL mode.
- **`docker-compose.yml`** gains `eight-west-api` with `./data:/data`, `env_file: .env`
  (Turnstile secret, IP-hash secret), no published ports — only nginx can reach it.
- **`deploy/nginx.conf`** gains two `location` blocks with `proxy_pass`, `client_max_body_size
  4k`, and passes `CF-Connecting-IP` through as `X-Forwarded-For`.
- **`src/ui/net/`** — the only place in the game that knows a network exists: `api.ts` (base
  URL, 3-second timeout, every failure swallowed to `null`), `memorials.ts`, `leaderboard.ts`,
  `identity.ts` (run id, player token). `src/sim/` does not import any of it.

### 1.3 The purity rule, applied

The sim already takes memorials at `createGame(seed, memorials)` and reports the run's dead in
`state.runMemorials`; `computeScore` and `victorySet` already produce everything the
leaderboard needs. Phase 4 adds exactly three things to the sim, all data-in / data-out:

1. `Memorial.id?: string` (optional; the server's id, ignored by the rules).
2. A `leaderboard` phase that renders whatever `state.board` holds, plus the actions
   `LEADERBOARD_LOADED { board }` and `OPEN 'leaderboard'`. The UI fetches, then dispatches;
   the sim never fetches. A `board === null` renders "The leaderboard is out of range here.
   Try again from a town with signal." and a Back key.
3. A `claim` phase after victory (display name, then optional email, then consent) using the
   existing single-field `input` mechanism with a new `kind: 'email'`. It produces
   `state.claim: { name, email | null, consented }` and the UI posts it. Both renderers get the
   flow for free because it is a Screen like any other; Heritage draws it in phosphor, Comic
   in caption boxes and a balloon.

Everything else is the UI layer's side effects in `main.ts`, next to the existing
`addMemorials` / `storeSave` calls.

## 2. Data model

SQLite, WAL mode, one file. Times are ISO-8601 UTC strings. Ids are ULIDs (sortable, no
sequence to leak counts).

```sql
create table memorials (
  id           text primary key,          -- ulid, minted by the server
  run_id       text not null unique,      -- client uuid; one memorial per run
  mile         integer not null check (mile between 0 and 730),
  day          integer not null check (day between 1 and 400),
  cause        text not null,             -- must be one of the sim's DEATH_CAUSES
  names        text not null,             -- json array of filtered crew names, <= 5 x 16 chars
  epitaph      text not null,             -- filtered, uppercase, <= 60 chars
  status       text not null default 'visible', -- visible | hidden | reviewed_ok | removed
  hide_reason  text,                      -- 'filter' | 'reports' | 'admin' | null
  report_count integer not null default 0,
  ip_hash      text,                      -- salted daily hash; nulled by the 30-day purge
  created_at   text not null
);
create index memorials_mile on memorials (status, mile);

create table runs (                        -- the leaderboard
  id            text primary key,
  run_id        text not null unique,
  player_token  text not null,             -- hashed; lets the same browser see "your rank"
  score         integer not null check (score >= 0),
  occupation    text not null check (occupation in ('ceo','sysadmin','intern')),
  days          integer not null,
  survivors     integer not null check (survivors between 1 and 5),
  survivor_names text not null,            -- json, filtered
  summit_route  text check (summit_route in ('grade','old80')),
  celebration   text check (celebration in ('cannonball','swan','towels')),
  display_name  text not null,             -- filtered, 2..16 chars; defaults to first survivor
  lead_id       text references leads(id),
  status        text not null default 'visible',
  ip_hash       text,
  created_at    text not null
);
create index runs_score on runs (status, score desc, created_at);

create table leads (                       -- the 8 West IT 365 list
  id              text primary key,
  email           text not null unique,    -- lowercased, trimmed
  display_name    text not null,
  consent_text    text not null,           -- the exact sentence they ticked, versioned in code
  consent_at      text not null,
  unsubscribe_token text not null unique,
  unsubscribed_at text,
  source_run_id   text,
  ip_hash         text
);

create table reports (
  id          text primary key,
  memorial_id text not null references memorials(id),
  reason      text not null check (reason in ('rude','real-name','spam','other')),
  ip_hash     text,
  created_at  text not null
);

create table cards (                       -- rendered share cards, keyed by run
  run_id     text primary key,
  kind       text not null check (kind in ('grave','victory')),
  png        blob not null,
  created_at text not null
);
```

**Not stored:** raw IPs, user agents, seeds, save files, anything about the browser, anything
the player did not type into a box on a screen that says it will be shared.

**Retention (enforced by a nightly job in the API process):** `ip_hash` columns and the
`reports.ip_hash` are set to null after 30 days; `cards` older than 90 days are deleted (they
re-render on demand); `leads` rows with `unsubscribed_at` older than 30 days have their email
replaced by its SHA-256 (so a re-subscribe is recognisable, the address is gone); memorials and
runs are kept — they are the game.

## 3. API surface

All under `/api/`, JSON in and out, `Content-Type` enforced, bodies capped at 4 KB. Every POST
carries `Turnstile-Token` (see §4) and `X-Player-Token`. Errors are `{ error: string }` with a
4xx; the client treats *any* non-2xx or network failure identically (carry on offline).

### Memorials (4A)

| | |
|---|---|
| `GET /api/memorials?seed=<string>` | A route-wide **sample**, not the table: the 730 miles in 20 buckets of 36.5 mi, up to 2 per bucket, chosen by `hash(seed, bucket)` over the visible rows in that bucket weighted 70/30 recent/random. ≤ 40 rows, each `{ id, names, mile, day, cause, epitaph }`. `Cache-Control: public, max-age=300`; the seed lands in the URL so the edge cache varies by run without a cookie. |
| `POST /api/memorials` | Body `{ runId, mile, day, cause, names, epitaph }`. Filter runs (§4); returns `201 { id, status: 'visible' \| 'hidden' }`. Idempotent on `runId` (a second post updates, never duplicates — the player can retype an epitaph). |
| `POST /api/memorials/:id/report` | Body `{ reason }`. One report per `(memorial, ip_hash)` per day. The second distinct report hides the memorial (`hide_reason='reports'`) until Frank reviews it. Returns `204`. |

### Leaderboard (4B)

| | |
|---|---|
| `GET /api/leaderboard?run=<runId>` | `{ top: [{ rank, displayName, score, occupation, days, survivors, summitRoute, celebration }] (25), yours: { rank, score, total } \| null }`. `yours` needs the `X-Player-Token` that posted the run. `Cache-Control: private, max-age=60` (varies by token) — or `public` for the tokenless call from the title screen. |
| `POST /api/runs` | Body `{ runId, score, occupation, days, survivorNames, summitRoute, celebration, displayName, email?, consent? }`. The server **recomputes nothing** — it cannot; the sim is client-side — but it validates ranges (§4.4) and rejects a score the occupation and survivor count cannot reach. Returns `201 { id, rank, total, claimed: boolean, unsubscribeUrl? }`. |
| `GET /unsubscribe/:token` | A plain HTML page: "You're off the list. Sorry to see you go." Idempotent, no confirmation step — one click. Linked from the claim screen and every email Frank sends. |

### Share cards (4C)

| | |
|---|---|
| `GET /api/card/:runId.png` | 1200×630 PNG. Renders from the `runs` or `memorials` row (only posted runs have cards). `Cache-Control: public, max-age=31536000, immutable`. 404 otherwise. |
| `GET /r/:runId` | The page a shared link lands on: `og:title`, `og:description`, `og:image` (the card), `twitter:card=summary_large_image`, then a `<meta http-equiv=refresh>` to `/?r=<runId>` so humans reach the game and crawlers get the card. The game reads `?r=` and shows a title-screen line: *"Someone dared you. They died of GAS-STATION SUSHI at mile 212."* |

### Admin (all phases)

No admin web surface. Frank reviews from the box:

```
docker compose exec eight-west-api node admin.mjs queue        # hidden memorials + reports
docker compose exec eight-west-api node admin.mjs ok <id>      # reviewed_ok (visible again)
docker compose exec eight-west-api node admin.mjs remove <id>  # removed for good
docker compose exec eight-west-api node admin.mjs leads.csv    # the list, minus unsubscribed
sqlite3 data/8wt.db                                            # everything else
```

## 4. Moderation, abuse, and validation

### 4.1 What is automatic (every POST, before the row exists)

1. **Length and charset.** Epitaph ≤ 60, names ≤ 16 and ≥ 1, display name 2–16. Allowed:
   `A–Z 0–9 space . , ' ! ? - &` and the curly apostrophe. Everything else is dropped, then the
   string is re-checked. Runs of the same character collapse to two (`!!!!!!` → `!!`).
2. **Contact-info reject.** Anything matching a URL, an `@`, a run of 7+ digits, or the words
   `www`, `.com`, `http`, `snap`, `insta`, `discord`, `whatsapp` is rejected outright with
   `{ error: 'no-contact' }` and the copy in §6. This is the one filter the player is told
   about, because the fix is obvious and the goal (no kid posting their number) matters more
   than stealth.
3. **The word list.** A curated list in `server/src/words/` (profanity, slurs, sexual terms,
   the usual evasions) matched after **normalisation**: lowercase, leetspeak folded (`0→o 1→i
   3→e 4→a 5→s 7→t @→a $→s`), non-letters stripped, and a spaced-letters collapse
   (`s h i t` → `shit`). A hit anywhere in epitaph, names, or display name → the row is saved
   with `status='hidden', hide_reason='filter'`. **The response is `201 { status: 'hidden' }`
   and the game behaves exactly as if it were visible** (the memorial is in the player's own
   localStorage anyway). The player is never told which word tripped it. Frank sees it in the
   queue; false positives (Scunthorpe) get `ok`'d.
4. **Cause and numbers.** `cause` must be in the sim's `DEATH_CAUSES`; `mile` 0–730; `day`
   1–400; `score` within what the occupation multiplier and survivor count can produce
   (`max = multiplier × (5 × 500 + supplyCap + cashCap)` — a constant computed from `TUNING`
   and shared as a test fixture so sim and server agree).
5. **Rate limits** (in-process token buckets keyed on `ip_hash`): 6 memorial POSTs/hour,
   6 run POSTs/hour, 20 reports/day, 60 GETs/minute; and one row per `runId` for life.
   Over the limit → `429`, and the game carries on offline.
6. **Turnstile.** Every POST carries a token from the Turnstile widget in **managed** mode
   (invisible for almost everyone; a checkbox for the suspicious). The server verifies against
   `siteverify` with the secret from `.env`. If the widget fails to load (ad blocker, old
   browser), the client does not post at all and the memorial stays local — no error, no
   nagging. If `TURNSTILE_SECRET` is unset (dev), verification is skipped and a warning logs
   once.

### 4.2 What Frank reviews

Only two queues, both from `admin.mjs queue`:

- **Filter hits** — hidden on arrival. Frank `ok`s the false positives when he feels like it.
  Nothing is waiting on him; a hidden row costs nothing.
- **Reported memorials** — hidden on the second distinct report. Frank `ok`s or `remove`s.

No pre-approval queue: the delight of "my memorial is on the road right now" is the feature,
and the filter plus the two-strike report is enough for a game whose worst case is a rude
epitaph seen by one crew a day.

### 4.3 What is deliberately not built

No user bans (no users), no IP bans (Cloudflare's WAF does that at the edge if it ever
matters), no appeal flow (a hidden memorial is invisible to strangers and untouched for the
player), no ML moderation.

## 5. Privacy

### 5.1 Rules the code enforces

- **No cookies of our own.** No session, no login. Visits are counted by **Google Analytics 4**
  (Frank's call, 2026-08-25: the players are the generation that played the original, and
  GA4 is what 8 Westalytics already reads). GA4 sets its own cookies; the privacy note says
  so. The tag is loaded with `anonymize_ip` on and Google signals off, and the game sends no
  custom events that carry names, epitaphs, or emails — only screen/phase names and outcomes
  (died / made the cliffs / claimed).
- **No email is ever required, shown, or hinted at.** The leaderboard shows `display_name`
  only. `leads` is never joined into a public response.
- **18+ for the email field.** The consent sentence says so (§6). The site is general
  audience; this is a small business's mailing list, and the demographic it wants is the one
  that owns the businesses. Kids are told, in plain words, to skip it. (COPPA runs on actual
  knowledge; we never ask for an age and never collect a child's email on purpose.)
- **Names are nicknames.** The naming screen and the epitaph screen both say so, and
  `real-name` is a report reason that hides the memorial on the first report from anyone.
- **IP hashing:** `ip_hash = HMAC-SHA256(secret ‖ YYYY-MM-DD, ip)` with the secret in
  `.env`. The daily date in the key means hashes from different days cannot be joined, and
  the secret means nobody can brute-force the IPv4 space against the table. Nulled at 30 days.
- **Minimum storage.** See the "Not stored" list in §2. Raw IPs never touch disk (nginx
  `access_log off` for `/api/`).
- **Retention:** §2. **Data requests:** a mailbox on the privacy note; Frank deletes by
  `sqlite3` or `admin.mjs remove`.
- **Transport:** Cloudflare terminates TLS; the tunnel is encrypted; the API container is not
  on any published port.

### 5.2 The privacy note (site copy, verbatim)

Lives in the About screen and at `/privacy` (a static page in `public/`). This is the whole
note; it is meant to be read by a twelve-year-old and their parent.

> **What The 8 West Trail keeps**
>
> The game runs in your browser. Your saved run and your crew's memorials are stored on your
> own device, and you can clear them any time by clearing your browser data.
>
> If you're online when your crew dies, the game posts your memorial — the crew's nicknames,
> the mile, the cause, and your epitaph — so other players pass it on the road. That's the
> whole idea. Don't put real names, phone numbers, or anything private in there; the game will
> stop you from posting contact details, and anyone can report a memorial that shouldn't be up.
>
> If you make it to Sunset Cliffs, you can put a nickname on the leaderboard. That's all that
> shows.
>
> Giving us your email is optional, and it's for grown-ups: it's how 8 West IT sends
> occasional news about the company and the game. Every email has an unsubscribe link, and so
> does the screen where you signed up. Your email is never shown to anyone and never sold.
>
> We use Google Analytics to see how many people play and how far they get. It sets cookies,
> and it doesn't tell us who you are. To stop bots, the game uses Cloudflare Turnstile when
> you post. To stop spam, we keep a scrambled version of your internet address for 30 days and then delete
> it; nobody can turn it back into you.
>
> Want something removed, or your email gone? Write to privacy@8westit.com and say which
> memorial or which address. We'll do it within a week.
>
> 8 West Ventures, LLC · updated August 2026

## 6. The words on the screens (verbatim)

These are the exact strings the game will ship. The sim owns the ones in Screens (both
themes render them); `main.ts` owns the button labels.

**Naming screen** (one added line under the prompt):
> Nicknames, please — these ride on the road for other players to see.

**Epitaph screen** (one added line):
> Other crews will read this. Keep it clean, keep it yours, no phone numbers.

**Contact-info reject** (the only filter message the player ever sees; shown in place, the
input stays open):
> That looks like a phone number, address, or link. The road doesn't carry those — try again.

**Dead screen** (replaces "The memorial will stand by the road for the next crew to pass."
when the post succeeded; the old line stays when offline or hidden — the player cannot tell the
difference, by design):
> Your memorial stands at mile 212. The next crew through will pass it.

**Memorial sighting** (existing travel log line, plus a report affordance on the same line):
> You pass a small roadside memorial at mile 212: "REST EASY, DANA" — [report]

**Report prompt** (a Screen with four choices; the memorial hides on two reports, or one for
real-name):
> Why should this come down?  1) Rude  2) Someone's real name  3) Spam  4) Something else
> Thanks. We'll take a look.

**Victory → claim, screen 1:**
> **THE 8 WEST LEADERBOARD**
> You made the cliffs with a score of 3,240. That's good for #37 of 1,204 runs.
> Put a nickname on the board? (2–16 letters; this is all anyone sees)
> [input]  ·  0) Skip it

**Claim, screen 2 (email; optional):**
> Want 8 West IT to email you now and then — news about the company, the game, and what's
> new on the road? Grown-ups only; if you're under 18, skip this.
> [email input]  ·  0) No thanks

**Claim, screen 3 (consent; only if an email was typed):**
> ☐ I'm 18 or older, and I'd like occasional email from 8 West IT. I can unsubscribe with one
> click, any time.
> 1) That's right, sign me up  ·  0) Actually, no

(The ticked sentence is stored verbatim as `consent_text`, versioned as `consent-v1` in code.)

**Claim done:**
> You're #37. Your unsubscribe link, if you ever want it: 8wt.8westit.com/unsubscribe/…
> (it's saved on this device too)

**Leaderboard screen footer (the CTA):**
> Every run on this board got here on a 1985 van. Your business should be on something newer.
> 8 West IT 365 — flat-rate IT for small business — 8westit.com/365

**Score / dead screen CTA** (one line, same on both endings; replaces nothing, appended
after the choices):
> Presented by 8 West IT 365 — the company named for the highway. 8westit.com/365

**Unsubscribe page:**
> **You're off the list.** No more email from 8 West IT. The leaderboard keeps your nickname
> and score; write to privacy@8westit.com if you want those gone too.

**Offline / API down** (the leaderboard screen only; memorials and posts fail silently):
> The leaderboard is out of range here. Try again from a town with signal.

None of these strings contain the words "Oregon Trail". Kannon's rules are untouched: T1D
is not a `cause`, so it can never appear on a memorial.

## 7. Identity without accounts

- **`runId`** — `crypto.randomUUID()` minted in `main.ts` when a game is created, stored in
  the save alongside the state (not in the sim's `GameState`; it sits next to it in the
  `8wt.save.v2` envelope, which becomes `v3`). It is the idempotency key for both POSTs and
  the key for the share card.
- **`playerToken`** — 32 random bytes, base64url, minted once per browser and kept in
  `localStorage['8wt.player.v1']`. Sent as `X-Player-Token`; the server stores `sha256(token)`
  on `runs`. It proves nothing about a person; it lets the same browser ask "which of these
  runs are mine?" so the leaderboard can highlight them and `yours.rank` can be answered.
  Losing it loses "your rank" and nothing else.
- **Rank** is computed server-side: `1 + count(runs where status='visible' and score >
  mine)`, ties by earlier `created_at`. Returned on `POST /api/runs` (so the claim screen can
  say "#37 of 1,204" before asking for anything) and on `GET /api/leaderboard?run=`. The
  leaderboard screen shows the top 25 and, if the player's run is not in it, a divider and
  their own row.
- **Display name** defaults to the first survivor's name; the claim screen lets them change
  it. Two runs can share a name; the id is the id.

## 8. Rollout

Every step ships behind the same switch: `VITE_8WT_API` (build-time base URL; empty means
"there is no network", which is what tests and `npm run dev` get unless set) and `?offline=1`
(runtime, for the e2e run and for demos). The game with the API unreachable is exactly the
Phase 3 game — verified by the existing Playwright playthrough running with the flag off.

**4A — Memorials (lowest risk, most delight).**
`server/` scaffold, SQLite schema + migrations, the filter + word list, `GET/POST
/api/memorials`, report endpoint, rate limiter, Turnstile verify, IP hashing + purge job,
`admin.mjs`, compose + nginx wiring, `src/ui/net/`, the merge of remote + local memorials at
`createGame`, the post at death, the naming/epitaph copy, the report Screen, the privacy note
+ `/privacy`, the GA4 tag and the handful of outcome events, the CTA line on the endings. Deploy, verify at
8wt.8westit.com, watch the queue for a few days.

**4B — Leaderboard and the lead list.**
`runs` + `leads`, `POST /api/runs`, `GET /api/leaderboard`, `/unsubscribe/:token`, the
`claim` phase and the `leaderboard` phase in the sim, title-screen entry, `leads.csv` export.
Deploy, seed the board with a handful of Frank's own runs so it is not empty on day one.

**4C — Share cards.**
`cards`, `GET /api/card/:runId.png` (resvg + vendored Bangers/Comic Neue + the van PNG from
`public/assets/van/`), `/r/:runId`, the `?r=` title-screen line, "Copy your story" gains the
`/r/` link. Verify the unfurl in Slack, Teams, iMessage, and X's card validator.

**4D — Funnel polish (small, after 4B has a week of data).** Where the CTA sits is decided in
§6; 4D is copy tuning, a UTM on the CTA links, and the analytics goals. Nothing structural.

Each step is its own PR with its own deploy; none is merged with a red test.

## 9. Build plan with tests

The repo keeps `npm test` (vitest, root) green for the game; the server gets its own
`npm test` in `server/` (vitest too, against `:memory:` SQLite via `node:sqlite`) and the
root `package.json` gains `test:server` and `test:all`. Playwright learns to intercept
`/api/*` with `page.route` so the playthrough exercises both the online and the offline paths
without a running server.

### 4A tasks

| # | Task | Tests |
|---|---|---|
| A1 | `server/` scaffold: Hono, `node:sqlite`, config from env, health endpoint, Dockerfile | `GET /api/health` → 200; boots with no env |
| A2 | Schema + migration runner (`server/src/db.ts`, numbered SQL files) | migrate on empty DB; migrate is idempotent; interface has no SQLite-only leaks (a fake adapter compiles) |
| A3 | Text filter (`server/src/filter.ts`) + word list | charset, collapse, contact-info regexes, leet normalisation, spaced letters, Scunthorpe passes, each listed word (and its leet forms) hides, a fixture of 50 real-looking epitaphs all pass |
| A4 | Validation of the memorial body against the sim's constants (`shared/` fixture generated from `TUNING` + `DEATH_CAUSES`) | every sim cause accepted; unknown cause rejected; mile/day bounds |
| A5 | `POST /api/memorials` + idempotency + status | visible path; hidden path returns 201; second post with same runId updates; bad JSON → 400; > 4 KB → 413 |
| A6 | Sampler for `GET /api/memorials?seed=` | ≤ 40 rows; ≤ 2 per bucket; hidden never returned; same seed → same sample; different seeds differ; empty table → `[]` |
| A7 | Reports: one per ip/day, two → hidden, real-name → hidden on one | state machine over 3 reporters |
| A8 | Rate limiter + IP hash + purge job | bucket refill; hash changes with date; purge nulls only rows > 30 d |
| A9 | Turnstile verify (fetch mocked) and the skip-when-unset warning | pass / fail / unset |
| A10 | `admin.mjs queue / ok / remove` | runs against a temp DB; output snapshot |
| A11 | compose + nginx: second service, proxy blocks, `access_log off`, `client_max_body_size` | `docker compose config` parses; an nginx `-t` in CI |
| A12 | `src/ui/net/api.ts` (timeout, swallow, flag) and `memorials.ts` | fetch mocked: timeout → null; 500 → null; flag off → never calls fetch |
| A13 | Merge remote + local at `createGame`; dedupe by id; local wins on collision; post at death; the `Memorial.id` field | sim tests unchanged; merge unit tests; `main.ts` side-effect test via a fake renderer |
| A14 | Sim: naming/epitaph copy lines, the `report` Screen, the CTA line | `view()` snapshot tests in `test/game.test.ts`; both renderers render the new Screen (existing renderer tests) |
| A15 | Privacy note in About + `public/privacy.html`; GA4 tag in `index.html` (`VITE_GA4_ID`), outcome events from `main.ts` | a test greps every string in §5.2/§6 for "Oregon Trail" (must be absent) |
| A16 | Playwright: playthrough with `page.route('/api/**')` — online (mocked 201) and offline (`?offline=1`); the death path posts once; the memorial sighting appears from a mocked GET | `npm run e2e` |
| A17 | Deploy and verify live: post a real memorial, see it from a second browser, report it twice from two networks, `admin.mjs queue` shows it | manual, recorded in the PR |

### 4B tasks

| # | Task | Tests |
|---|---|---|
| B1 | `runs` + `leads` tables, `POST /api/runs` with score-bounds validation, rank query | rank with ties; bound rejects; idempotent on runId |
| B2 | Lead capture: email normalisation, consent required to store, unsubscribe token, `leads.csv` | no consent → no lead row; duplicate email updates `display_name` only; CSV excludes unsubscribed |
| B3 | `GET /api/leaderboard` public + `yours` by token | top 25; `yours` null without token; own run highlighted |
| B4 | `GET /unsubscribe/:token` | idempotent; unknown token → same page (no oracle) |
| B5 | Sim: `claim` phase (3 screens, `kind: 'email'`), `leaderboard` phase, `LEADERBOARD_LOADED`, title-screen entry | `view()` tests; reduce tests; the flow is skippable at every step; a run that skips posts nothing |
| B6 | `src/ui/net/leaderboard.ts`, `identity.ts` (runId, playerToken, save envelope v3 with v2 migration) | fetch mocked; migration test |
| B7 | Both renderers draw `claim` and `leaderboard` (Heritage: plain phosphor lines; Comic: caption stack + one balloon) | renderer tests; screenshots at desktop/phone in the PR |
| B8 | Playwright: victory → claim with email → mocked 201 → rank shown; victory → skip; title → leaderboard → mocked list | `npm run e2e` |
| B9 | Deploy; seed 5 runs; verify a claim end-to-end and the CSV | manual |

### 4C tasks

| # | Task | Tests |
|---|---|---|
| C1 | Card renderer (`server/src/card.ts`): SVG template → PNG via resvg; vendored fonts; grave and victory layouts | renders both kinds; 1200×630; fixture PNG hash stable; missing run → 404 |
| C2 | `GET /api/card/:runId.png` + `cards` cache + immutable headers | cache hit on second call |
| C3 | `GET /r/:runId` OG page + refresh; the `?r=` title-screen line in the sim | HTML contains all OG tags; unknown id → generic card; `view()` test for the dare line |
| C4 | "Copy your story" includes the `/r/` link when the run was posted | `shareText` test |
| C5 | Deploy; validate unfurls (Slack, Teams, iMessage, X validator) | manual, screenshots in the PR |

### Definition of done for Phase 4

- Game with `VITE_8WT_API` empty is byte-for-byte the Phase 3 bundle's behaviour (e2e offline
  path green).
- Root `npm test`, `server npm test`, and `npm run e2e` green; Heritage screenshots unchanged
  except for the new Screens.
- A stranger's memorial appears on the road; a rude one does not; a reported one comes down;
  Frank can list the queue and the leads from the box.
- A claimed run shows its rank; an email is stored only with consent; unsubscribe is one click.
- A shared run unfurls with its card in Slack and Teams.
- The privacy note is live at `/privacy`; nothing on the site prints "Oregon Trail".

## 10. Things Frank has to do outside the repo

1. Create a **Turnstile** widget (managed mode) for `8wt.8westit.com` in the Cloudflare
   dashboard; put the site key in the build (`VITE_TURNSTILE_SITE_KEY`) and the secret in
   coastline's `~/apps/eight-west-trail/.env`.
2. Generate `IP_HASH_SECRET` (`openssl rand -hex 32`) into the same `.env`.
3. Create the **GA4 property** (web stream for `8wt.8westit.com`) and send the Measurement ID (`G-…`) for `VITE_GA4_ID`. Done 2026-08-25.
4. `privacy@8westit.com` — created as an Office 365 shared mailbox, 2026-08-25.
5. Confirm the `8westit.com/365` landing URL for the CTA.
6. Nothing changes in the tunnel.

## 11. Open questions (defaults chosen; say so if wrong)

- **Report affordance in Heritage.** A `[report]` suffix on a log line is a small visual
  change to Heritage's travel screen. Default: it is a numbered choice on the travel screen
  only on the day a memorial was passed (no new glyphs), which keeps Heritage's look intact.
- **Seeding the board.** Default: Frank's own runs, labelled with real nicknames, not
  invented ones.
- **Email sending.** Phase 4 stores leads; it sends nothing. The mailing tool Frank already
  uses takes the CSV. If he wants a welcome email from the game itself, that is a 4D item and
  needs an email provider.
- **Audience (settled 2026-08-25).** Frank: this is not a kids' game; the players are the
  generation that played the original. The nickname rules and the 18+ email line stay because
  they cost nothing, but analytics is GA4, not a cookieless counter.
