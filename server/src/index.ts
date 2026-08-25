// Entrypoint: build the app from process.env, start the housekeeping timers, listen.

import { serve } from '@hono/node-server';
import { createApp } from './app.ts';
import { purge } from './purge.ts';

const app = createApp({ env: process.env });

const HOUR = 3_600_000;
const housekeeping = () => {
  const done = purge(app.db);
  if (done.memorials || done.reports || done.runs || done.leads) console.log(`purge: nulled ${done.memorials} memorial, ${done.reports} report, ${done.runs} run ip hashes; hashed ${done.leads} unsubscribed emails`);
  for (const rl of Object.values(app.limits)) rl.sweep();
};
housekeeping();
setInterval(housekeeping, 6 * HOUR).unref();

serve({ fetch: app.fetch, port: app.config.port, hostname: '0.0.0.0' }, (info) => {
  console.log(`eight-west-api listening on ${info.address}:${info.port}, db ${app.config.dbPath}`);
});
