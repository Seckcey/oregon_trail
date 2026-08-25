#!/usr/bin/env node
// Frank's review queue, from the box (docs/PHASE4-PLAN.md §3, Admin):
//   docker compose exec eight-west-api node admin.mjs queue
//   docker compose exec eight-west-api node admin.mjs ok <id>
//   docker compose exec eight-west-api node admin.mjs remove <id>
// DB_PATH names the database (the container sets it).

import { migrate, openDb } from './src/db.ts';

const USAGE = 'usage: node admin.mjs queue | ok <id> | remove <id>';

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

function queue(db) {
  const rows = db.all(`select * from memorials where status = 'hidden' order by created_at`);
  const out = [`HIDDEN MEMORIALS (${rows.length})`, ''];
  for (const r of rows) {
    const names = JSON.parse(r.names).join(', ');
    out.push(`${r.id}  ${r.hide_reason.padEnd(7)}  mile ${r.mile}  day ${r.day}  ${r.cause}  ${r.created_at.slice(0, 10)}`);
    out.push(`  ${names} — "${r.epitaph}"`);
    const reports = db.all('select reason from reports where memorial_id = ? order by created_at', [r.id]);
    if (reports.length) out.push(`  reports (${reports.length}): ${reports.map((x) => x.reason).join(', ')}`);
    out.push('');
  }
  out.push('ok <id> to show it again · remove <id> to take it down for good');
  return `${out.join('\n')}\n`;
}

function setStatus(db, id, status, hideReason) {
  const changed = db.run('update memorials set status = ?, hide_reason = ? where id = ?', [status, hideReason, id]).changes;
  if (changed === 0) fail(`no memorial ${id}`);
  return `${id} → ${status}\n`;
}

const [cmd, id] = process.argv.slice(2);
const db = openDb(process.env.DB_PATH ?? './data/8wt.db');
migrate(db);
try {
  if (cmd === 'queue') process.stdout.write(queue(db));
  else if (cmd === 'ok' && id) process.stdout.write(setStatus(db, id, 'reviewed_ok', null));
  else if (cmd === 'remove' && id) process.stdout.write(setStatus(db, id, 'removed', 'admin'));
  else fail(USAGE);
} finally {
  db.close();
}
