import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { resolve } from 'node:path';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});
const g = globalThis;
for (const k of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'Node',
  'Element',
  'KeyboardEvent',
  'MutationObserver',
  'getComputedStyle',
  'DOMParser',
  'Range',
  'Selection',
  'Text',
  'Event',
  'CustomEvent',
  'HTMLInputElement',
  'DocumentFragment',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]) {
  try {
    Object.defineProperty(g, k, {
      value: dom.window[k],
      configurable: true,
      writable: true,
    });
  } catch {}
}
dom.window.Range.prototype.getClientRects = () => ({
  length: 0,
  item: () => null,
  [Symbol.iterator]: function* () {},
});
dom.window.Range.prototype.getBoundingClientRect = () => ({
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
});
dom.window.HTMLElement.prototype.scrollIntoView = () => {};
document.elementFromPoint = () => null;

const out = resolve('node_modules/.smoke/smoke.cjs');
await build({
  entryPoints: [resolve('scripts/smoke.test.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  outfile: out,
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react-dom/*', 'react/*'],
  logLevel: 'error',
});
const { createRequire } = await import('node:module');
const { run } = createRequire(import.meta.url)(out);
const results = await run();
console.log(results.join('\n'));
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
