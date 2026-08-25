-- 4B: the leaderboard and the 8 West IT 365 list (docs/PHASE4-PLAN.md §2).
create table leads (
  id                text primary key,
  email             text not null unique,
  display_name      text not null,
  consent_text      text not null,
  consent_at        text not null,
  unsubscribe_token text not null unique,
  unsubscribed_at   text,
  source_run_id     text,
  ip_hash           text
);

create table runs (
  id             text primary key,
  run_id         text not null unique,
  player_token   text not null,
  score          integer not null check (score >= 0),
  occupation     text not null check (occupation in ('ceo', 'sysadmin', 'intern')),
  days           integer not null,
  survivors      integer not null check (survivors between 1 and 5),
  survivor_names text not null,
  summit_route   text check (summit_route in ('grade', 'old80')),
  celebration    text check (celebration in ('cannonball', 'swan', 'towels')),
  display_name   text not null,
  lead_id        text references leads(id),
  status         text not null default 'visible' check (status in ('visible', 'hidden', 'reviewed_ok', 'removed')),
  ip_hash        text,
  created_at     text not null
);
create index runs_score on runs (status, score desc, created_at);
