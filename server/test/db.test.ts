import { describe, expect, it } from 'vitest';
import { migrate, openDb, type Db } from '../src/db.ts';

describe('the schema and its migration runner', () => {
  it('migrates an empty database to the 4A tables', () => {
    const db = openDb(':memory:');
    const applied = migrate(db);
    expect(applied).toBeGreaterThan(0);
    const tables = db.all<{ name: string }>("select name from sqlite_master where type='table' order by name").map((r) => r.name);
    expect(tables).toEqual(expect.arrayContaining(['memorials', 'reports', 'schema_migrations']));
    db.close();
  });

  it('is idempotent: a second run applies nothing', () => {
    const db = openDb(':memory:');
    migrate(db);
    expect(migrate(db)).toBe(0);
    db.close();
  });

  it('enforces the memorial constraints from the plan (mile 0–730, day 1–400)', () => {
    const db = openDb(':memory:');
    migrate(db);
    const insert = (mile: number, day: number) =>
      db.run(
        `insert into memorials (id, run_id, mile, day, cause, names, epitaph, created_at)
         values (?, ?, ?, ?, 'THIRST', '["A"]', 'X', '2026-08-25T00:00:00Z')`,
        [`id${mile}-${day}`, `run${mile}-${day}`, mile, day],
      );
    expect(() => insert(730, 400)).not.toThrow();
    expect(() => insert(731, 1)).toThrow();
    expect(() => insert(1, 0)).toThrow();
    db.close();
  });

  it('the Db interface has no SQLite-only leaks: a fake adapter type-checks', () => {
    const fake: Db = {
      run: () => ({ changes: 0 }),
      get: () => undefined,
      all: () => [],
      exec: () => {},
      close: () => {},
    };
    expect(migrate(fake)).toBeGreaterThan(0); // the fake applies every file (it records none)
  });
});
