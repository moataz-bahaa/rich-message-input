import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Run with `vite demo` (root = demo/).
export default defineConfig({
  plugins: [react()],
  build: { outDir: '../demo-dist', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
});
