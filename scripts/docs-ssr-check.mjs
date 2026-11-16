// Renders the docs App on the server to catch runtime errors in the docs site.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../docs', import.meta.url));
const server = await createServer({ root, configFile: fileURLToPath(new URL('../docs/vite.config.ts', import.meta.url)), plugins: [react()], server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { App } = await server.ssrLoadModule('/src/App.tsx');
  const html = renderToString(createElement(App));
  const ok = ['Playground', 'Custom slash commands','rich-message-input'].every((t) => html.includes(t));
  console.log(ok ? `PASS docs render (${html.length} bytes)` : 'FAIL docs render');
  process.exitCode = ok ? 0 : 1;
} finally {
  await server.close();
}
