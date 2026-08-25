import { defineConfig, devices } from '@playwright/test';

// The playthrough runs against the production bundle served by `vite preview`,
// so what it verifies is what gets deployed.
export default defineConfig({
  testDir: 'e2e',
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort --host 127.0.0.1',
    // The build under test is the networked one (the API at /api, no Turnstile, no GA4);
    // e2e/memorials.spec.ts mocks the API and proves ?offline=1 and "API down" are silent.
    env: { VITE_8WT_API: '/api', VITE_TURNSTILE_SITE_KEY: '', VITE_GA4_ID: '' },
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
