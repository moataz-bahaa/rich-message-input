import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { useSlot } from '../slots';
import { Icon } from './Icons';
import type { EditorApi, Messages, ToolbarItemId } from '../types';

export const DEFAULT_TOOLBAR: ToolbarItemId[] = [
  'heading',
  'bold',
  'italic',
  'underline',
  'strike',
  'highlight',
  'code',
  'link',
  'bulletList',
  'orderedList',
  'codeBlock',
  'divider',
  'attach',
  'audio',
  'video',
  'direction',
];

type Props = {
  editor: Editor;
  items: ToolbarItemId[];
  messages: Messages;
  api: EditorApi;
  disabled?: boolean;
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '⌘' : 'Ctrl+';

const shortcuts: Partial<Record<ToolbarItemId, string>> = {
  bold: `${mod}B`,
  italic: `${mod}I`,
  underline: `${mod}U`,
  strike: `${mod}⇧S`,
  highlight: `${mod}⇧H`,
  code: `${mod}E`,
  link: `${mod}K`,
  bulletList: `${mod}⇧8`,
  orderedList: `${mod}⇧7`,
};

export const Toolbar = ({ editor, items, messages, api, disabled }: Props) => {
  const toolbarSlot = useSlot('toolbar', 'rte-toolbar');
  const buttonSlot = useSlot('toolbarButton', 'rte-btn');
  const selectSlot = useSlot('toolbarSelect', 'rte-select');
  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      highlight: e.isActive('highlight'),
      link: e.isActive('link'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      codeBlock: e.isActive('codeBlock'),
      heading: [1, 2, 3].find((level) => e.isActive('heading', { level })) ?? 0,
    }),
  });

  const actions: Record<Exclude<ToolbarItemId, 'heading'>, () => void> = {
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    underline: () => editor.chain().focus().toggleUnderline().run(),
    strike: () => editor.chain().focus().toggleStrike().run(),
    code: () => editor.chain().focus().toggleCode().run(),
    highlight: () => editor.chain().focus().toggleHighlight().run(),
    bulletList: () => editor.chain().focus().toggleBulletList().run(),
    orderedList: () => editor.chain().focus().toggleOrderedList().run(),
    codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
    divider: () => editor.chain().focus().setHorizontalRule().run(),
    link: api.openLinkEditor,
    attach: api.pickFiles,
    audio: () => api.startRecording('audio'),
    video: () => api.startRecording('video'),
    direction: api.toggleDirection,
  };

  return (
    <div {...toolbarSlot} role="toolbar" aria-label={messages.toolbar.toolbarLabel}>
      {items.map((id) => {
        if (id === 'heading') {
          return (
            <select
              key={id}
              {...selectSlot}
              aria-label={messages.toolbar.heading}
              title={messages.toolbar.heading}
              disabled={disabled}
              value={active.heading}
              onChange={(e) => {
                const level = Number(e.target.value);
                const chain = editor.chain().focus();
                if (level === 0) chain.setParagraph().run();
                else chain.setHeading({ level: level as 1 | 2 | 3 }).run();
              }}
            >
              <option value={0}>{messages.commands.paragraph?.title ?? 'Text'}</option>
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
          );
        }
        const isActive = id in active && Boolean((active as Record<string, unknown>)[id]);
        const label = messages.toolbar[id];
        const shortcut = shortcuts[id];
        const isToggle = id in active;
        return (
          <button
            key={id}
            type="button"
            {...buttonSlot}
            data-active={isActive || undefined}
            aria-label={label}
            aria-pressed={isToggle ? isActive : undefined}
            title={shortcut ? `${label} (${shortcut})` : label}
            disabled={disabled}
            // keep focus/selection in the editor
            onMouseDown={(e) => e.preventDefault()}
            onClick={actions[id]}
          >
            <Icon name={id} />
          </button>
        );
      })}
    </div>
  );
};
