import {
  previewProps,
  shortcuts,
  slashCommandIds,
  slots,
  textInputProps,
} from './api';
import { ApiTable } from './components/ApiTable';
import { CodeBlock } from './components/CodeBlock';
import { ExampleCard } from './components/ExampleCard';
import { Playground } from './components/Playground';

import { ArabicRtl } from './examples/ArabicRtl';
import arabicSource from './examples/ArabicRtl.tsx?raw';
import { BasicChat } from './examples/BasicChat';
import basicSource from './examples/BasicChat.tsx?raw';
import { ControlledValue } from './examples/ControlledValue';
import controlledSource from './examples/ControlledValue.tsx?raw';
import { CustomSlashCommands } from './examples/CustomSlashCommands';
import slashSource from './examples/CustomSlashCommands.tsx?raw';
import { RefApi } from './examples/RefApi';
import refSource from './examples/RefApi.tsx?raw';
import { StylingExample } from './examples/StylingExample';
import stylingSource from './examples/StylingExample.tsx?raw';
import { ToolbarAndCommands } from './examples/ToolbarAndCommands';
import toolbarSource from './examples/ToolbarAndCommands.tsx?raw';
import { UploadHandlerExample } from './examples/UploadHandler';
import uploadSource from './examples/UploadHandler.tsx?raw';

const nav = [
  ['start', 'Getting started'],
  ['playground', 'Playground'],
  ['examples', 'Examples'],
  ['content', 'Content format'],
  ['slash', 'Slash commands'],
  ['styling', 'Styling'],
  ['api', 'API reference'],
] as const;

const examples = [
  {
    id: 'ex-basic',
    title: 'Basic chat',
    description:
      'Uncontrolled editor. Send with the button or Ctrl+Enter; each sent message is rendered with <Preview />.',
    Live: BasicChat,
    source: basicSource,
  },
  {
    id: 'ex-controlled',
    title: 'Controlled value',
    description:
      'Keep the document in your own state, derive plain text from it, and clear it after sending.',
    Live: ControlledValue,
    source: controlledSource,
  },
  {
    id: 'ex-slash',
    title: 'Custom slash commands',
    description: 'Register your own commands. Type / then “date” or “shrug”.',
    Live: CustomSlashCommands,
    source: slashSource,
  },
  {
    id: 'ex-upload',
    title: 'Uploads and recording',
    description:
      'The package never uploads files. Provide onUpload and return a URL from your own storage. Try the paperclip, mic and camera buttons.',
    Live: UploadHandlerExample,
    source: uploadSource,
  },
  {
    id: 'ex-rtl',
    title: 'Arabic and RTL',
    description:
      'Arabic UI, per-paragraph direction for mixed text, and runtime direction switching.',
    Live: ArabicRtl,
    source: arabicSource,
  },
  {
    id: 'ex-toolbar',
    title: 'Toolbar and command customization',
    description: 'Show only the tools you want and remove commands.',
    Live: ToolbarAndCommands,
    source: toolbarSource,
  },
  {
    id: 'ex-styling',
    title: 'Styling',
    description: 'CSS variables, per-part classNames and styles.',
    Live: StylingExample,
    source: stylingSource,
  },
  {
    id: 'ex-ref',
    title: 'Imperative API (ref)',
    description: 'Focus, read, and clear the editor from outside.',
    Live: RefApi,
    source: refSource,
  },
];

const installCode = `npm install rich-message-input
# peer dependencies: react and react-dom (>= 18)`;

const quickStartCode = `import { useState } from 'react';
import { TextInput, Preview, type RichTextDocument } from 'rich-message-input';
import 'rich-message-input/styles.css';

export const Chat = () => {
  const [messages, setMessages] = useState<RichTextDocument[]>([]);

  return (
    <>
      {messages.map((doc, i) => <Preview key={i} value={doc} />)}
      <TextInput onSubmit={(doc) => setMessages((all) => [...all, doc])} />
    </>
  );
};`;

const contentCode = `{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [
      { "type": "text", "text": "Hi ", "marks": [] },
      { "type": "text", "text": "there", "marks": [{ "type": "bold" }] }
    ]},
    { "type": "attachment", "attrs": { "kind": "audio", "src": "https://…/voice.webm", "duration": 4.2 } }
  ]
}`;

const slashCode = `import { TextInput, defaultSlashCommands, type SlashCommand } from 'rich-message-input';

const today: SlashCommand = {
  id: 'date',                       // typed as /date
  title: 'Today',
  description: 'Insert the current date',
  keywords: ['time'],               // extra search terms
  run: ({ editor, range, api }) =>  // "/date" is already removed
    editor.chain().focus().insertContent(new Date().toLocaleDateString()).run(),
};

<TextInput extraCommands={[today]} />          // add (same id overrides a built-in)
<TextInput commands={[today]} />               // replace the whole list`;

const stylingCode = `<TextInput
  className="my-editor"
  classNames={{ toolbar: 'bar', sendButton: 'btn btn-primary' }}
  styles={{ editor: { fontSize: 17 }, slashMenu: { width: 320 } }}
/>

/* plain CSS: every part has a stable hook */
[data-rte-slot='toolbarButton'][data-active] { background: hotpink; }

/* design tokens */
.my-editor { --rte-accent: #7c3aed; --rte-radius: 16px; }`;

export const App = () => (
  <div className='layout'>
    <nav className='nav' aria-label='Documentation'>
      <a className='brand' href='#start'>
        rich-message-input
      </a>
      {nav.map(([id, label]) => (
        <a key={id} href={`#${id}`}>
          {label}
        </a>
      ))}
    </nav>

    <main>
      <header className='hero' id='start'>
        <h1>rich-message-input</h1>
        <p>
          A Slack-style inline rich text input for React, with a matching
          read-only <code>&lt;Preview /&gt;</code>. Slash commands, attachments,
          voice and video recording, and first-class Arabic/RTL support.
          Backend-agnostic and styled with plain CSS.
        </p>
        <h2>Install</h2>
        <CodeBlock code={installCode} label='bash' />
        <h2>Quick start</h2>
        <CodeBlock code={quickStartCode} label='tsx' />
        <p>
          The editor gives you a serializable JSON document; store it anywhere
          and render it later with <code>&lt;Preview /&gt;</code>. Controlled
          usage (<code>value</code> + <code>onChange</code>) works too.
        </p>
      </header>

      <section id='playground'>
        <h2>Playground</h2>
        <p>
          Change the options, type in the editor, and watch the preview, the
          JSON and the generated code. Try typing <code>/</code>.
        </p>
        <Playground />
      </section>

      <section id='examples'>
        <h2>Examples</h2>
        <p>
          Every example below is live, and the code shown is the exact source
          file that renders it.
        </p>
        {examples.map((example) => (
          <ExampleCard key={example.id} {...example} />
        ))}
      </section>

      <section id='content'>
        <h2>Content format</h2>
        <p>
          <code>onChange</code> and <code>onSubmit</code> give a{' '}
          <code>RichTextDocument</code>: Tiptap/ProseMirror JSON. Save it as
          JSON, then pass it to <code>&lt;Preview value /&gt;</code> or{' '}
          <code>&lt;TextInput value /&gt;</code>.
        </p>
        <CodeBlock code={contentCode} label='json' />
        <ul>
          <li>
            Nodes:{' '}
            <code>
              paragraph heading(1–3) bulletList orderedList listItem blockquote
              codeBlock horizontalRule hardBreak attachment
            </code>
          </li>
          <li>
            Marks: <code>bold italic underline strike code highlight link</code>
          </li>
          <li>
            Helpers: <code>toPlainText</code>, <code>isDocumentEmpty</code>,{' '}
            <code>getAttachments</code>, <code>EMPTY_DOCUMENT</code>
          </li>
          <li>
            <code>&lt;Preview /&gt;</code> only allows <code>http(s)</code>,{' '}
            <code>mailto</code>, <code>tel</code> and relative links, and never
            loads the editor runtime.
          </li>
        </ul>
      </section>

      <section id='slash'>
        <h2>Slash commands</h2>
        <p>
          Type <code>/</code> to open the menu and keep typing to filter by id,
          title or (localized) keywords. Built-in ids:
        </p>
        <p className='chips'>
          {slashCommandIds.map((id) => (
            <code key={id}>/{id}</code>
          ))}
        </p>
        <CodeBlock code={slashCode} label='tsx' />
        <h3>Keyboard shortcuts</h3>
        <div className='table-wrap'>
          <table>
            <tbody>
              {shortcuts.map(([keys, action]) => (
                <tr key={keys}>
                  <td>
                    <code>{keys}</code>
                  </td>
                  <td>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id='styling'>
        <h2>Styling</h2>
        <p>
          Three layers: <strong>CSS variables</strong> (<code>--rte-*</code>),{' '}
          <strong>per-part props</strong> (<code>classNames</code>,{' '}
          <code>styles</code>), and <strong>plain CSS</strong> through{' '}
          <code>data-rte-slot</code> attributes. The package stylesheet lives in{' '}
          <code>@layer rte</code>, so your own un-layered CSS (Tailwind, CSS
          modules, global CSS) wins without <code>!important</code>.
        </p>
        <CodeBlock code={stylingCode} label='tsx / css' />
        <ApiTable rows={slots} typeHeader='Component' />
      </section>

      <section id='api'>
        <h2>API reference</h2>
        <h3>&lt;TextInput /&gt;</h3>
        <ApiTable rows={textInputProps} />
        <p>
          A <code>ref</code> exposes{' '}
          <code>
            {
              '{ editor, focus(), clear(), getDocument(), setDocument(doc), isEmpty() }'
            }
          </code>{' '}
          (<code>TextInputHandle</code>). Slash command <code>run</code>{' '}
          receives <code>{'{ editor, range, api }'}</code>, where{' '}
          <code>api</code> has{' '}
          <code>
            openLinkEditor, pickFiles, startRecording, insertAttachment,
            toggleDirection
          </code>
          .
        </p>
        <h3>&lt;Preview /&gt;</h3>
        <ApiTable rows={previewProps} />
      </section>

      <footer>MIT licensed. Built on Tiptap and ProseMirror.</footer>
    </main>
  </div>
);
