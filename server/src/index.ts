// Entrypoint: build the app from process.env and listen.

import { serve } from '@hono/node-server';
import { createApp } from './app.ts';

const app = createApp({ env: process.env });
serve({ fetch: app.fetch, port: app.config.port, hostname: '0.0.0.0' }, (info) => {
  console.log(`eight-west-api listening on ${info.address}:${info.port}, db ${app.config.dbPath}`);
});
