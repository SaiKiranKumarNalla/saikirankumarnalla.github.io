import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Every top-level .html file is a page (multi-page site, no SPA router).
const pages = Object.fromEntries(
  readdirSync(import.meta.dirname)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), resolve(import.meta.dirname, f)])
);

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: { input: pages },
    assetsInlineLimit: 4096,
  },
});
