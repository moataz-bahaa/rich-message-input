import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Preview, TextInput, toPlainText, type DirectionSetting, type LocaleCode, type RichTextDocument, type SlashCommand } from '../src';
import '../src/styles.css';

const mixed: RichTextDocument = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Release notes / ملاحظات الإصدار' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'مرحباً! The ' },
        { type: 'text', text: 'new editor', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' يدعم ' },
        { type: 'text', text: 'العربية', marks: [{ type: 'highlight' }] },
        { type: 'text', text: ' and English in one message, with ' },
        { type: 'text', text: 'code()', marks: [{ type: 'code' }] },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'عنصر أول في القائمة' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second item' }] }] },
      ],
    },
  ],
};

// Example of extending the slash menu: /shrug appends a text snippet.
const extraCommands: SlashCommand[] = [
  {
    id: 'shrug',
    title: 'Shrug',
    description: 'Insert ¯\\_(ツ)_/¯',
    icon: '🤷',
    keywords: ['meh'],
    run: ({ editor }) => void editor.chain().focus().insertContent('¯\\_(ツ)_/¯ ').run(),
  },
];

const App = () => {
  const [locale, setLocale] = useState<LocaleCode>('en');
  const [direction, setDirection] = useState<DirectionSetting>('auto');
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto');
  const [doc, setDoc] = useState<RichTextDocument>(mixed);
  const [sent, setSent] = useState<RichTextDocument[]>([]);

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }} data-theme={theme}>
      <style>{`
        body { margin: 0; background: ${theme === 'dark' ? '#0f1114' : '#f6f6f7'}; color: ${theme === 'dark' ? '#ddd' : '#222'}; }
        .demo-controls { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0 20px; font-size: 14px; }
        .demo-pill-send { width: 52px; border-radius: 999px; }
        .demo-toolbar { background: rgba(124, 58, 237, .08); }
        h1 { margin: 0; font-size: 22px; } h2 { font-size: 15px; margin: 24px 0 8px; opacity: .7; text-transform: uppercase; letter-spacing: .04em; }
        pre.json { max-height: 220px; overflow: auto; padding: 12px; font-size: 12px; background: rgba(127,127,127,.12); border-radius: 8px; direction: ltr; }
        .sent { margin-bottom: 12px; padding: 12px; border: 1px solid rgba(127,127,127,.35); border-radius: 10px; background: ${theme === 'dark' ? '#1a1d21' : '#fff'}; }
      `}</style>

      <h1>rich-message-input</h1>
      <div className="demo-controls">
        <label>
          Locale{' '}
          <select value={locale} onChange={(e) => setLocale(e.target.value as LocaleCode)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>
        <label>
          Direction{' '}
          <select value={direction} onChange={(e) => setDirection(e.target.value as DirectionSetting)}>
            <option value="auto">auto (per paragraph)</option>
            <option value="ltr">LTR</option>
            <option value="rtl">RTL</option>
          </select>
        </label>
        <label>
          Theme{' '}
          <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
            <option value="auto">auto</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
      </div>

      <h2>Editor (controlled · Enter = new line · send with the button or Ctrl+Enter · try “/”)</h2>
      <TextInput
        value={doc}
        onChange={setDoc}
        locale={locale}
        direction={direction}
        onDirectionChange={setDirection}
        theme={theme}
        extraCommands={extraCommands}
        onSubmit={(d) => {
          setSent((s) => [d, ...s]);
          setDoc({ type: 'doc', content: [{ type: 'paragraph' }] });
        }}
        onError={(e) => alert(e.message)}
        maxFileSize={25 * 1024 * 1024}
        // Plug in your own storage here. Without onUpload, blob: URLs are used.
        // onUpload={async (file, meta) => ({ kind: meta.kind, src: await myStorage.put(file), name: meta.name })}
      />

      <h2>Custom styling (classNames + styles + CSS variables)</h2>
      <TextInput
        locale={locale}
        direction={direction}
        theme={theme}
        placeholder="Styled through props…"
        onSubmit={() => {}}
        style={{ ['--rte-accent' as string]: '#7c3aed', ['--rte-border-focus' as string]: '#7c3aed', borderRadius: 18 }}
        classNames={{ sendButton: 'demo-pill-send', toolbar: 'demo-toolbar' }}
        styles={{ editor: { fontSize: 17, fontFamily: 'Georgia, serif' }, footer: { paddingBlock: 6 } }}
      />

      <h2>Live preview</h2>
      <div className="sent">
        <Preview value={doc} locale={locale} direction={direction} theme={theme} />
      </div>

      {sent.length > 0 && (
        <>
          <h2>Sent messages</h2>
          {sent.map((d, i) => (
            <div className="sent" key={sent.length - i}>
              <Preview value={d} locale={locale} direction={direction} theme={theme} />
            </div>
          ))}
        </>
      )}

      <h2>Serialized content · plain text: “{toPlainText(doc).slice(0, 40)}”</h2>
      <pre className="json">{JSON.stringify(doc, null, 2)}</pre>
    </main>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
