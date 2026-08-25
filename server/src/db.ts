// The storage boundary. Everything above this file talks to `Db`; only this
// file knows it is SQLite (node:sqlite, built into Node 22+). If the API ever
// moves to Workers, D1 gets an adapter here and nothing else changes.

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

export type Params = SQLInputValue[];

export interface Db {
  run(sql: string, params?: Params): { changes: number };
  get<T>(sql: string, params?: Params): T | undefined;
  all<T>(sql: string, params?: Params): T[];
  exec(sql: string): void;
  close(): void;
}

export function openDb(path: string): Db {
  const sqlite = new DatabaseSync(path);
  if (path !== ':memory:') sqlite.exec('pragma journal_mode = wal');
  sqlite.exec('pragma foreign_keys = on');
  return {
    run(sql, params = []) {
      const r = sqlite.prepare(sql).run(...params);
      return { changes: Number(r.changes) };
    },
    get<T>(sql: string, params: Params = []) {
      return sqlite.prepare(sql).get(...params) as T | undefined;
    },
    all<T>(sql: string, params: Params = []) {
      return sqlite.prepare(sql).all(...params) as T[];
    },
    exec(sql) {
      sqlite.exec(sql);
    },
    close() {
      sqlite.close();
    },
  };
}

export const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

/** Apply every numbered .sql file not yet recorded. Returns how many ran. */
export function migrate(db: Db, dir = MIGRATIONS_DIR): number {
  db.exec('create table if not exists schema_migrations (name text primary key, applied_at text not null)');
  const done = new Set(db.all<{ name: string }>('select name from schema_migrations').map((r) => r.name));
  const files = readdirSync(dir).filter((f) => /^\d+_.*\.sql$/.test(f)).sort();
  let applied = 0;
  for (const name of files) {
    if (done.has(name)) continue;
    db.exec('begin');
    try {
      db.exec(readFileSync(join(dir, name), 'utf8'));
      db.run('insert into schema_migrations (name, applied_at) values (?, ?)', [name, new Date().toISOString()]);
      db.exec('commit');
    } catch (err) {
      db.exec('rollback');
      throw err;
    }
    applied += 1;
  }
  return applied;
}
