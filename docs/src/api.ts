export type ApiRow = { name: string; type: string; default?: string; description: string };

export const textInputProps: ApiRow[] = [
  { name: 'value', type: 'RichTextDocument | null', description: 'Controlled value. Pair with onChange.' },
  { name: 'defaultValue', type: 'RichTextDocument | null', description: 'Initial value for uncontrolled usage.' },
  { name: 'onChange', type: '(doc) => void', description: 'Called on every content change.' },
  { name: 'onSubmit', type: '(doc) => void', description: 'Send button, Ctrl/Cmd+Enter, or Enter with submitOnEnter. Uncontrolled editors clear afterwards; empty messages and in-flight uploads are ignored.' },
  { name: 'submitOnEnter', type: 'boolean', default: 'false', description: 'Enter sends, Shift+Enter starts a new line. Lists and code blocks keep Enter.' },
  { name: 'hideSendButton', type: 'boolean', default: 'false', description: 'Hide the built-in send button.' },
  { name: 'placeholder', type: 'string', description: 'Overrides the localized placeholder.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Read-only, dimmed editor.' },
  { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Focus the end of the content on mount.' },
  { name: 'theme', type: "'auto' | 'light' | 'dark'", default: "'auto'", description: 'auto follows prefers-color-scheme.' },
  { name: 'minHeight / maxHeight', type: 'number (px)', default: '56 / 320', description: 'Editor height bounds; scrolls past maxHeight.' },
  { name: 'locale', type: "'en' | 'ar'", default: "'en'", description: 'UI language. Arabic also makes the toolbar and menus RTL.' },
  { name: 'messages', type: 'DeepPartial<Messages>', description: 'Override any UI string.' },
  { name: 'direction', type: "'ltr' | 'rtl' | 'auto'", default: "'auto'", description: 'Content direction. auto picks per paragraph, so mixed English/Arabic works.' },
  { name: 'defaultDirection', type: "'ltr' | 'rtl' | 'auto'", default: "'auto'", description: 'Initial direction when uncontrolled.' },
  { name: 'onDirectionChange', type: '(direction) => void', description: 'Fires when the toolbar button or /direction switches direction.' },
  { name: 'toolbar', type: 'ToolbarItemId[] | false', default: 'DEFAULT_TOOLBAR', description: 'Toolbar items and their order; false hides the toolbar.' },
  { name: 'commands', type: 'SlashCommand[]', default: 'defaultSlashCommands', description: 'Replace the slash command list.' },
  { name: 'extraCommands', type: 'SlashCommand[]', description: 'Add commands (same id overrides a built-in).' },
  { name: 'disableSlashCommands', type: 'boolean', default: 'false', description: 'Turn the / menu off.' },
  { name: 'extensions', type: 'Extensions', description: 'Extra Tiptap extensions. Read once at mount.' },
  { name: 'accept', type: 'string', description: 'Allowed file types, same syntax as <input accept>. Applies to picker, paste and drop.' },
  { name: 'maxFileSize', type: 'number (bytes)', description: 'Larger files and recordings are rejected through onError.' },
  { name: 'onUpload', type: '(file, meta) => AttachmentData', default: 'blob: URL', description: 'Store the file and return its URL. Without it, temporary blob: URLs are used (demo only).' },
  { name: 'onFilesAdded', type: '(files: File[]) => void', description: 'Called with the accepted files before upload.' },
  { name: 'onRecordingComplete', type: '(blob, info) => void', description: 'Called with the raw recording; it is then uploaded through onUpload.' },
  { name: 'onError', type: '(error: Error) => void', description: 'Validation, upload and recording errors. Defaults to console.error.' },
  { name: 'onFocus / onBlur', type: '() => void', description: 'Editor focus events.' },
  { name: 'className / style', type: 'string / CSSProperties', description: 'Root element.' },
  { name: 'classNames / styles', type: 'Partial<Record<Slot, string | CSSProperties>>', description: 'Per-part classes and inline styles. See Styling.' },
];

export const previewProps: ApiRow[] = [
  { name: 'value', type: 'RichTextDocument | null | undefined', description: 'Document produced by <TextInput />.' },
  { name: 'direction', type: "'ltr' | 'rtl' | 'auto'", default: "'auto'", description: 'Same meaning as on the editor.' },
  { name: 'locale', type: "'en' | 'ar'", default: "'en'", description: 'Sets the root direction for RTL locales.' },
  { name: 'theme', type: "'auto' | 'light' | 'dark'", default: "'auto'", description: '' },
  { name: 'renderAttachment', type: '(data, defaultNode) => ReactNode', description: 'Customize attachment rendering (signed URLs, lightbox...).' },
  { name: 'className / style', type: 'string / CSSProperties', description: 'Root element.' },
  { name: 'classNames / styles', type: 'slots: root, content, attachment', description: 'Per-part classes and inline styles.' },
];

export const slots: ApiRow[] = [
  { name: 'root', type: 'TextInput, Preview', description: 'Outer container.' },
  { name: 'toolbar, toolbarButton, toolbarSelect', type: 'TextInput', description: 'Formatting bar, its buttons, the heading dropdown.' },
  { name: 'linkEditor', type: 'TextInput', description: 'Inline link form.' },
  { name: 'scroll, editor', type: 'TextInput', description: 'Scrolling area and the editable element inside it.' },
  { name: 'recorder', type: 'TextInput', description: 'Audio/video recording panel.' },
  { name: 'footer, status, sendButton', type: 'TextInput', description: 'Bottom row, upload status text, send button.' },
  { name: 'slashMenu, slashItem', type: 'TextInput', description: 'Slash popup (rendered in a portal) and its rows.' },
  { name: 'content, attachment', type: 'Preview', description: 'Content wrapper and attachment blocks.' },
];

export const toolbarItems = [
  'heading', 'bold', 'italic', 'underline', 'strike', 'highlight', 'code', 'link',
  'bulletList', 'orderedList', 'codeBlock', 'divider', 'attach', 'audio', 'video', 'direction',
] as const;

export const slashCommandIds = [
  'paragraph', 'h1', 'h2', 'h3', 'bold', 'italic', 'underline', 'strike', 'highlight', 'code',
  'codeblock', 'link', 'list', 'numbered', 'quote', 'divider', 'attach', 'audio', 'video', 'direction',
];

export const shortcuts: Array<[string, string]> = [
  ['Ctrl/Cmd + B / I / U', 'Bold / italic / underline'],
  ['Ctrl/Cmd + Shift + S', 'Strikethrough'],
  ['Ctrl/Cmd + Shift + H', 'Highlight'],
  ['Ctrl/Cmd + E', 'Inline code'],
  ['Ctrl/Cmd + K', 'Insert or edit link'],
  ['Ctrl/Cmd + Shift + 7 / 8', 'Numbered / bulleted list'],
  ['Shift + Enter', 'New line (new block)'],
  ['Ctrl/Cmd + Enter', 'Send'],
  ['/', 'Open the slash menu; ↑ ↓ choose, Enter or Tab run, Esc closes'],
];
