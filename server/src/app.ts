// The Hono app. createApp() builds a fresh app over a fresh database so tests
// can spin one up per case with `:memory:`; index.ts builds the real one.

import { Hono } from 'hono';
import { configFrom, type Config } from './config.ts';

export interface AppOptions {
  dbPath?: string;
  env?: Record<string, string | undefined>;
}

export interface App {
  fetch: Hono['fetch'];
  request: Hono['request'];
  config: Config;
}

export function createApp(opts: AppOptions = {}): App {
  const config = configFrom({ ...(opts.env ?? {}), ...(opts.dbPath ? { DB_PATH: opts.dbPath } : {}) });
  const app = new Hono();

  app.get('/api/health', (c) => c.json({ ok: true }));

  return { fetch: app.fetch, request: app.request.bind(app), config };
}
