/// <reference types="vitest/config" />
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

// Real art lives in public/assets/ under the filenames in docs/ASSET-LIST.md.
// The build scans that tree and hands the list to src/ui/assets.ts, so the
// Comic theme knows which slots have art and which still get placeholders —
// no manifest to maintain, no 404s. In dev the server restarts itself when
// a file lands.
const ASSET_ROOT = join(process.cwd(), 'public', 'assets');
const ASSET_EXTENSIONS = /\.(svg|png|webp|jpe?g|gif|mp3|ogg|mp4|webm)$/i;

function listAssets(dir: string, root: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const name of entries.sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listAssets(full, root));
    else if (ASSET_EXTENSIONS.test(name)) out.push(relative(root, full).split('\\').join('/'));
  }
  return out;
}

/** Dev only: when art is dropped into public/assets/, restart so the manifest sees it. */
function assetWatcher(): Plugin {
  return {
    name: '8wt-asset-watcher',
    apply: 'serve',
    configureServer(server) {
      server.watcher.add(ASSET_ROOT);
      const onChange = (file: string) => {
        if (file.startsWith(ASSET_ROOT) && ASSET_EXTENSIONS.test(file)) {
          server.config.logger.info(`[8wt] art changed: ${relative(ASSET_ROOT, file)} — restarting`);
          void server.restart();
        }
      };
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}

export default defineConfig({
  plugins: [assetWatcher()],
  define: {
    __ASSET_MANIFEST__: JSON.stringify(listAssets(ASSET_ROOT, ASSET_ROOT)),
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 8192,
  },
  server: {
    // Playwright's scratch folder holds locked files that crash the watcher on Windows.
    watch: { ignored: ['**/.playwright-mcp/**', '**/dist/**'] },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
