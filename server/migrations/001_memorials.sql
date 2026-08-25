-- 4A: roadside memorials and the reports that take them down.
create table memorials (
  id           text primary key,
  run_id       text not null unique,
  mile         integer not null check (mile between 0 and 730),
  day          integer not null check (day between 1 and 400),
  cause        text not null,
  names        text not null,
  epitaph      text not null,
  status       text not null default 'visible' check (status in ('visible', 'hidden', 'reviewed_ok', 'removed')),
  hide_reason  text check (hide_reason in ('filter', 'reports', 'admin')),
  report_count integer not null default 0,
  ip_hash      text,
  created_at   text not null
);
create index memorials_mile on memorials (status, mile);

create table reports (
  id          text primary key,
  memorial_id text not null references memorials(id),
  reason      text not null check (reason in ('rude', 'real-name', 'spam', 'other')),
  ip_hash     text,
  created_at  text not null
);
create index reports_memorial on reports (memorial_id, ip_hash);
