// Smoke test run under jsdom (see scripts/smoke.mjs). Not published.
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Preview, TextInput, toPlainText, type RichTextDocument, type TextInputHandle } from '../src';
import { toCssText } from '../src/slots';
import { getAttachments, normalizeUrl, sanitizeHref } from '../src/content';
import { matchesAccept } from '../src/lib/files';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const results: string[] = [];
const check = (name: string, ok: boolean, extra?: unknown) => {
  results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' ' + JSON.stringify(extra)}`);
};

export const run = async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const handle = { current: null as TextInputHandle | null };
  let last: RichTextDocument | null = null;
  let submitted: RichTextDocument | null = null;

  await act(async () => {
    root.render(
      createElement(TextInput, {
        ref: (h: TextInputHandle | null) => (handle.current = h),
        onChange: (d: RichTextDocument) => (last = d),
        onSubmit: (d: RichTextDocument) => (submitted = d),
        locale: 'ar',
      }),
    );
  });
  await act(async () => sleep(50));
  const ed = handle.current!.editor!;
  check('editor created', !!ed);
  check('root is rtl for ar locale', host.querySelector('.rte-root')!.getAttribute('dir') === 'rtl');
  check('toolbar rendered', host.querySelectorAll('.rte-toolbar .rte-btn').length >= 10);

  // formatting + serialization
  await act(async () => {
    ed.chain().focus().insertContent('مرحبا hello').selectAll().toggleBold().toggleHighlight().run();
  });
  const json = ed.getJSON() as RichTextDocument;
  const marks = json.content?.[0]?.content?.[0]?.marks?.map((m) => m.type);
  check('bold+highlight serialized', !!marks?.includes('bold') && !!marks?.includes('highlight'), marks);
  check('onChange fired', last !== null);

  // block decorations => dir="auto"
  check('paragraph has dir attr', !!host.querySelector('.rte-content p[dir]'), host.querySelector('.rte-content')?.innerHTML);

  // slash menu
  await act(async () => {
    ed.commands.clearContent();
    ed.chain().focus().insertContent('/div').run();
  });
  await act(async () => sleep(50));
  const opts = Array.from(document.querySelectorAll('.rte-slash [role=option]'));
  check('slash menu opens + filters', opts.length >= 1 && opts[0]!.textContent!.includes('/divider'), opts.map((o) => o.textContent));

  await act(async () => {
    ed.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  await act(async () => sleep(30));
  const after = ed.getJSON() as RichTextDocument;
  check('/divider inserts horizontalRule and removes text', JSON.stringify(after).includes('horizontalRule') && !JSON.stringify(after).includes('/div'), after);

  // attachment round trip + preview
  await act(async () => {
    ed.commands.insertAttachment({ kind: 'audio', src: 'blob:x', name: 'voice.webm', duration: 3 });
    ed.commands.insertAttachment({ kind: 'file', src: 'https://e.com/a.pdf', name: 'a.pdf', size: 2048 });
  });
  const withMedia = ed.getJSON() as RichTextDocument;
  const html = renderToString(createElement(Preview, { value: withMedia }));
  check('preview renders audio', html.includes('<audio'), html);
  check('preview renders file card', html.includes('a.pdf') && html.includes('2.0 KB'), html);

  const rtl = renderToString(createElement(Preview, { value: withMedia, locale: 'ar' }));
  check('preview rtl root', rtl.includes('dir="rtl"'));
  const evil = renderToString(
    createElement(Preview, {
      value: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }] },
    }),
  );
  check('preview strips javascript: links', !evil.includes('javascript:'), evil);

  // uncontrolled submit clears
  await act(async () => {
    ed.commands.setContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'send me' }] }] });
    ed.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
  });
  check('Mod+Enter submits', submitted !== null, submitted);

  // security: control characters inside the scheme must not bypass the check
  check('sanitizeHref blocks java-tab-script:', sanitizeHref('java	script:alert(1)') === undefined);
  check('sanitizeHref keeps https', sanitizeHref('https://a.com') === 'https://a.com');
  check('normalizeUrl keeps host:port', normalizeUrl('localhost:3000') === 'https://localhost:3000', normalizeUrl('localhost:3000'));
  check('normalizeUrl rejects javascript:', normalizeUrl('javascript:alert(1)') === undefined);
  check('normalizeUrl adds https', normalizeUrl('example.com') === 'https://example.com');
  const attachments = getAttachments({ type: 'doc', content: [{ type: 'attachment', attrs: { kind: 'file', src: 'javascript:x' } }, { type: 'attachment', attrs: { kind: 'image', src: 'https://a/b.png', size: '5' } }] });
  check('getAttachments drops unsafe and coerces', attachments.length === 1 && attachments[0]!.size === 5, attachments);
  const file = (name: string, type: string) => new File(['x'], name, { type });
  check('accept: image/* matches png', matchesAccept(file('a.png', 'image/png'), 'image/*'));
  check('accept: rejects pdf for image/*', !matchesAccept(file('a.pdf', 'application/pdf'), 'image/*'));
  check('accept: extension rule', matchesAccept(file('a.PDF', ''), '.pdf'));
  check(
    'toPlainText separates nested list items',
    toPlainText({ type: 'doc', content: [{ type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'b' }] }] }] }] }) === 'a' + String.fromCharCode(10) + 'b',
  );

  // Shift+Enter starts a new block, so a heading only affects its own line
  await act(async () => {
    ed.commands.setContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'one' }] }] });
    ed.commands.focus('end');
    ed.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true }));
  });
  await act(async () => {
    ed.commands.insertContent('two');
    ed.commands.setHeading({ level: 1 });
  });
  const types = (ed.getJSON() as RichTextDocument).content?.map((n) => n.type);
  check('Shift+Enter makes a new block; heading is per line', JSON.stringify(types?.slice(0, 2)) === '["paragraph","heading"]', types);

  await act(async () => root.unmount());

  // ---- styling slots ----
  const styledHost = document.createElement('div');
  document.body.appendChild(styledHost);
  const styledRoot = createRoot(styledHost);
  const styledHandle = { current: null as TextInputHandle | null };
  await act(async () => {
    styledRoot.render(
      createElement(TextInput, {
        ref: (h: TextInputHandle | null) => (styledHandle.current = h),
        onSubmit: () => {},
        className: 'consumer-root',
        style: { borderRadius: 3 },
        classNames: { root: 'cn-root', toolbar: 'cn-toolbar', toolbarButton: 'cn-btn', scroll: 'cn-scroll', editor: 'cn-editor', footer: 'cn-footer', sendButton: 'cn-send', slashMenu: 'cn-menu', slashItem: 'cn-item' },
        styles: { root: { color: 'red' }, toolbar: { padding: 9 }, editor: { fontSize: 17, lineHeight: 1.5 }, sendButton: { opacity: 0.5 }, slashMenu: { width: 333 } },
      }),
    );
  });
  await act(async () => sleep(50));
  const q = (sel: string) => styledHost.querySelector<HTMLElement>(sel);
  const rootEl = q('.rte-root')!;
  check('root merges className + classNames.root and keeps base', ['consumer-root', 'cn-root', 'rte-root'].every((c) => rootEl.classList.contains(c)), rootEl.className);
  check('root merges style + styles.root', rootEl.style.color === 'red' && rootEl.style.borderRadius === '3px', rootEl.getAttribute('style'));
  check('toolbar slot class + style', !!q('.rte-toolbar.cn-toolbar') && q('.rte-toolbar')!.style.padding === '9px');
  check('toolbarButton slot class', !!q('.rte-btn.cn-btn'));
  check('scroll + footer + sendButton slots', !!q('.rte-scroll.cn-scroll') && !!q('.rte-footer.cn-footer') && !!q('.rte-send.cn-send') && q('.rte-send')!.style.opacity === '0.5');
  const editorEl = q('.rte-content')!;
  check('editor slot class + inline style', editorEl.classList.contains('cn-editor') && editorEl.style.fontSize === '17px' && editorEl.style.lineHeight === '1.5', editorEl.getAttribute('style'));
  check('data-rte-slot hooks present', ['root', 'toolbar', 'editor', 'footer'].every((n) => !!q('[data-rte-slot="' + n + '"]')));
  await act(async () => {
    styledHandle.current!.editor!.chain().focus().insertContent('/bo').run();
  });
  await act(async () => sleep(50));
  const menu = document.querySelector<HTMLElement>('.rte-slash.cn-menu');
  check('slashMenu slot (portal) class + style override', !!menu && menu.style.width === '333px', menu?.getAttribute('style'));
  check('slashItem slot class', !!document.querySelector('.rte-slash__item.cn-item'));
  await act(async () => styledRoot.unmount());

  const previewHtml = renderToString(
    createElement(Preview, {
      value: { type: 'doc', content: [{ type: 'attachment', attrs: { kind: 'file', src: 'https://e.com/a.pdf', name: 'a.pdf' } }] },
      className: 'p-root',
      classNames: { root: 'pc-root', content: 'pc-content', attachment: 'pc-att' },
      styles: { content: { padding: 4 }, attachment: { borderRadius: 2 } },
    }),
  );
  check('preview slots', ['p-root', 'pc-root', 'pc-content', 'pc-att', 'padding:4px', 'border-radius:2px', 'data-rte-slot="attachment"'].every((t) => previewHtml.includes(t)), previewHtml);

  check('toCssText kebab + px', toCssText({ fontSize: 17, marginInlineStart: 4 }) === 'font-size:17px;margin-inline-start:4px');
  check('toCssText unitless + custom props', toCssText({ lineHeight: 1.5, zIndex: 3, ['--x' as string]: 8 }) === 'line-height:1.5;z-index:3;--x:8', toCssText({ lineHeight: 1.5, zIndex: 3, ['--x' as string]: 8 }));
  return results;
};
