import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Run with `vite docs` (root = docs/). `base: './'` makes the build work under any GitHub Pages path.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    // The docs import the package exactly like a consumer would; resolve it to the local source.
    alias: [
      { find: 'rich-message-input/styles.css', replacement: fromRoot('../src/styles.css') },
      { find: 'rich-message-input', replacement: fromRoot('../src/index.ts') },
    ],
  },
  build: { outDir: '../docs-dist', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
});
