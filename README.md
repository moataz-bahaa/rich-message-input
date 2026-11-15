# rich-message-input

A Slack-style inline rich text input for React, plus a read-only `<Preview />` that renders the same content.
Built on [Tiptap](https://tiptap.dev) (ProseMirror). Backend-agnostic, plain CSS, English + Arabic (LTR/RTL).

- Headings, body text, **bold**, *italic*, underline, ~~strike~~, `inline code`, highlight
- Links, bulleted/numbered lists, quotes, code blocks, dividers
- File attachments, voice (audio) and video recording
- `/` slash commands: filterable, keyboard-navigable, extensible
- Mixed English/Arabic in one message (per-paragraph direction), dynamic LTR/RTL switching
- Serializable JSON content; `<Preview />` doesn't load the editor runtime

**Docs, live examples and playground:** https://YOUR-USER.github.io/rich-message-input/ (source in `docs/`; deployment and publishing steps in [PUBLISHING.md](./PUBLISHING.md)).

## Install

```bash
npm install rich-message-input
```

Peer dependencies: `react` and `react-dom` (>= 18).

```tsx
import { TextInput, Preview } from 'rich-message-input';
import 'rich-message-input/styles.css';
```

## Usage

```tsx
import { useState } from 'react';
import { TextInput, Preview, type RichTextDocument } from 'rich-message-input';
import 'rich-message-input/styles.css';

export const Chat = () => {
  const [messages, setMessages] = useState<RichTextDocument[]>([]);

  return (
    <>
      {messages.map((doc, i) => <Preview key={i} value={doc} />)}

      {/* uncontrolled: the editor clears itself after onSubmit */}
      <TextInput
        submitOnEnter
        onSubmit={(doc) => setMessages((m) => [...m, doc])}
        onUpload={async (file, meta) => {
          const url = await myStorage.upload(file);          // your backend
          return { kind: meta.kind, src: url, name: meta.name };
        }}
      />
    </>
  );
};
```

Controlled usage: pass `value` and `onChange`. When controlled, clear it yourself after submit.

### Arabic / RTL

```tsx
<TextInput locale="ar" />                       // Arabic UI; chrome is RTL
<TextInput locale="en" direction="rtl" />       // force RTL
<TextInput direction="auto" />                  // default: each paragraph picks its own direction
<Preview value={doc} locale="ar" />
```

`direction="auto"` sets `dir="auto"` on every paragraph, heading, list and quote, so an Arabic line and an
English line in the same message each align and flow correctly. Code blocks are always LTR. The toolbar button
and the `/direction` command switch direction at runtime (`direction` / `onDirectionChange` for controlled use).
Layout uses CSS logical properties, so toolbar, lists, quotes and the slash menu mirror automatically.

Override or add languages with `messages` (deep partial of the `Messages` type):

```tsx
<TextInput locale="en" messages={{ placeholder: 'Say something', commands: { bold: { title: 'Strong' } } }} />
```

### Slash commands

Type `/` to open the menu; keep typing to filter (matches id, title, localized keywords). `↑ ↓` navigate,
`Enter`/`Tab` run, `Esc` closes. Built-ins: `paragraph h1 h2 h3 bold italic underline strike highlight code codeblock link list numbered quote divider attach audio video direction`.

```tsx
import { TextInput, defaultSlashCommands, type SlashCommand } from 'rich-message-input';

const today: SlashCommand = {
  id: 'date',
  title: 'Today',
  description: 'Insert the current date',
  icon: '📅',
  keywords: ['time'],
  run: ({ editor }) => editor.chain().focus().insertContent(new Date().toLocaleDateString()).run(),
};

<TextInput extraCommands={[today]} />                 // add (same id overrides a built-in)
<TextInput commands={[...defaultSlashCommands.filter(c => c.id !== 'video'), today]} />  // replace the list
```

`run` receives `{ editor, range, api }`; the typed `/query` text is already removed. `api` exposes
`openLinkEditor`, `pickFiles`, `startRecording`, `insertAttachment`, `toggleDirection`.

### Attachments and recording

The package never uploads anything itself. Provide `onUpload(file, meta)` and return an `AttachmentData`
(`{ kind, src, name?, size?, mimeType?, duration?, id? }`). Without it, files become `blob:` URLs (demo only; they won't survive a reload, and they are revoked when the editor unmounts).
Files can be added from the toolbar, `/attach`, drag & drop, or paste. Recordings use `MediaRecorder` (requires HTTPS/localhost and user permission);
the finished blob goes to `onRecordingComplete` and then through `onUpload` with `meta.duration`.

### Content format

`onChange`/`onSubmit` give a `RichTextDocument`: Tiptap/ProseMirror JSON. Store it as JSON and pass it to `<Preview value />` or `<TextInput value />`.

```json
{ "type": "doc", "content": [
  { "type": "paragraph", "content": [{ "type": "text", "text": "Hi", "marks": [{ "type": "bold" }] }] },
  { "type": "attachment", "attrs": { "kind": "audio", "src": "https://…/voice.webm", "duration": 4.2 } }
] }
```

Node types: `paragraph heading(1–3) bulletList orderedList listItem blockquote codeBlock horizontalRule hardBreak attachment`.
Marks: `bold italic underline strike code highlight link`. Helpers: `toPlainText`, `isDocumentEmpty`, `getAttachments`, `EMPTY_DOCUMENT`.
`<Preview />` only allows `http(s)`, `mailto`, `tel` and relative links; attachment sources additionally allow `blob:` and `data:image|audio|video`.

## API

### `<TextInput />` props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` / `defaultValue` | `RichTextDocument \| null` | | controlled / initial |
| `onChange` | `(doc) => void` | | every content change |
| `onSubmit` | `(doc) => void` | | send button, `Mod+Enter`, or `Enter` with `submitOnEnter`. Uncontrolled editors clear afterwards |
| `submitOnEnter` | `boolean` | `false` | Enter sends, Shift+Enter breaks line; lists/code blocks keep Enter |
| `hideSendButton` | `boolean` | `false` | |
| `placeholder`, `disabled`, `autoFocus` | | | |
| `className` / `style` | | | root element |
| `classNames` / `styles` | per-slot `string` / `CSSProperties` | | see Styling |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | `auto` follows `prefers-color-scheme` |
| `minHeight` / `maxHeight` | `number` (px) | 56 / 320 | scrolls beyond max |
| `locale` | `'en' \| 'ar'` | `'en'` | |
| `messages` | `DeepPartial<Messages>` | | override any string |
| `direction` / `defaultDirection` / `onDirectionChange` | `'ltr' \| 'rtl' \| 'auto'` | `'auto'` | |
| `toolbar` | `ToolbarItemId[] \| false` | `DEFAULT_TOOLBAR` | items and their order |
| `commands` / `extraCommands` | `SlashCommand[]` | built-ins | replace / extend |
| `disableSlashCommands` | `boolean` | `false` | |
| `extensions` | Tiptap `Extensions` | | extra extensions; read at mount only |
| `accept`, `maxFileSize` | `string`, `number` | | file picker filter; size limit in bytes |
| `onUpload` | `(file, meta) => AttachmentData` | blob URL | your storage |
| `onFilesAdded`, `onRecordingComplete`, `onError`, `onFocus`, `onBlur` | | | |

A `ref` exposes `{ editor, focus(), clear(), getDocument(), setDocument(doc), isEmpty() }` (`TextInputHandle`).

Toolbar ids: `heading bold italic underline strike code highlight link bulletList orderedList codeBlock divider attach audio video direction`.
Shortcuts: `Mod+B/I/U`, `Mod+Shift+S` strike, `Mod+Shift+H` highlight, `Mod+E` code, `Mod+K` link, `Mod+Shift+7/8` lists, `Mod+Enter` send.
Pasted rich text is cleaned to the supported schema; pasted/dropped files are attached.

### `<Preview />` props

`value`, `direction`, `locale`, `theme`, `className`, `style`, `classNames`, `styles`, and `renderAttachment(data, defaultNode)` to customize attachment rendering (signed URLs, lightbox…).

### Styling

Three layers, use whichever fits:

1. **Design tokens:** override `--rte-*` custom properties (`--rte-bg --rte-fg --rte-border --rte-border-focus --rte-accent --rte-mark --rte-link --rte-radius --rte-font --rte-mono` …) on `.rte-root`, your own class, or the `style` prop.
2. **Per-part props:** `className` / `style` style the root. `classNames` and `styles` style every other part.
3. **Plain CSS:** every part carries a stable `data-rte-slot="<name>"` attribute.

```tsx
<TextInput
  className="my-editor"
  classNames={{ toolbar: 'bar', sendButton: 'btn btn-primary' }}
  styles={{ editor: { fontSize: 17 }, slashMenu: { width: 320 } }}
/>
<Preview value={doc} classNames={{ content: 'prose' }} styles={{ attachment: { borderRadius: 4 } }} />
```

```css
[data-rte-slot='toolbarButton'][data-active] { background: hotpink; }
```

| Slot | `<TextInput />` part |
|---|---|
| `root` | outer container (same as `className` / `style`) |
| `toolbar`, `toolbarButton`, `toolbarSelect` | formatting bar, its buttons, the heading dropdown |
| `linkEditor` | inline link form |
| `scroll`, `editor` | scrolling area, and the editable element inside it |
| `recorder` | audio/video recording panel |
| `footer`, `status`, `sendButton` | bottom row, upload status text, send button |
| `slashMenu`, `slashItem` | slash command popup (rendered in a portal) and its rows |

`<Preview />` slots: `root`, `content`, `attachment`.

`classNames` values are added to the built-in `rte-*` classes; `styles` are inline, so they always win. The library stylesheet is inside an `@layer rte` block, so your normal, un-layered CSS (Tailwind, CSS modules, global CSS) overrides it without `!important` or extra specificity. This needs a browser with cascade layers (all current browsers).

## Architecture

```
src/
  TextInput.tsx            thin composition root: wires hooks, extensions and UI parts
  Preview.tsx              JSON to React renderer (no Tiptap runtime)
  content.ts               serialization helpers, URL/source sanitizing
  commands.ts              built-in slash commands + merge
  slash-items.ts           command to menu item resolution and search ranking
  link-actions.ts          apply/remove link on the editor
  editor-props.ts          paste/drop file handlers
  i18n.ts                  en / ar messages, direction resolution
  hooks/                   useAttachments, useMediaRecording, useSlashMenu, useDirection,
                           useControlledValue, useTextInputHandle, useErrorReporter
  lib/                     file validation, error and latest-ref helpers
  extensions/              attachment node, direction decorations, slash-command (Suggestion),
                           keyboard shortcuts, create-extensions (assembly)
  components/              Toolbar, SlashMenu, LinkEditor, RecorderPanel, Footer
  media/useRecorder.ts     MediaRecorder lifecycle
  slots.ts                 styling slots: classNames/styles context, data-rte-slot, toCssText
  styles.css
```

## Develop

```bash
npm install
npm run dev          # docs + playground at http://localhost:5173
npm run docs:build   # static site into docs-dist/
npm test             # jsdom smoke test (editor, slash menu, preview, sanitizing)
npm run build        # dist/ (ESM + CJS + .d.ts + styles.css)
npm publish          # runs typecheck + build first (see PUBLISHING.md)
```

Docs site: `docs/` (Vite app with the playground, runnable examples and API tables; each example file is rendered live and shown as its own source).

Not covered by automated tests: real browser recording, drag & drop, and IME/caret behavior in mixed-direction text. Check these in the demo.
