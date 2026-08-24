/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    assetsInlineLimit: 8192,
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
