import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Every top-level .html file and every sections/*.html file is a page (multi-page site, no SPA router).
const htmlIn = (dir, prefix = '') =>
  readdirSync(resolve(import.meta.dirname, dir))
    .filter((f) => f.endsWith('.html'))
    .map((f) => [prefix + f.replace(/\.html$/, ''), resolve(import.meta.dirname, dir, f)]);
const pages = Object.fromEntries([...htmlIn('.'), ...htmlIn('sections', 'sections/')]);

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: '_app', // not 'assets': collides with legacy 'Assets/' on case-insensitive disks
    rollupOptions: { input: pages },
    assetsInlineLimit: 4096,
  },
});
