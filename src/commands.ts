import type { SlashCommand } from './types';

/**
 * Built-in slash commands. Titles/descriptions come from the active locale
 * (`messages.commands[id]`) unless the command sets its own.
 * Add yours with the `extraCommands` prop or replace the list via `commands`.
 */
export const defaultSlashCommands: SlashCommand[] = [
  { id: 'paragraph', icon: 'T', run: ({ editor }) => void editor.chain().focus().setParagraph().run() },
  { id: 'h1', icon: 'H1', run: ({ editor }) => void editor.chain().focus().setHeading({ level: 1 }).run() },
  { id: 'h2', icon: 'H2', run: ({ editor }) => void editor.chain().focus().setHeading({ level: 2 }).run() },
  { id: 'h3', icon: 'H3', run: ({ editor }) => void editor.chain().focus().setHeading({ level: 3 }).run() },
  { id: 'bold', icon: 'B', run: ({ editor }) => void editor.chain().focus().toggleBold().run() },
  { id: 'italic', icon: 'I', run: ({ editor }) => void editor.chain().focus().toggleItalic().run() },
  { id: 'underline', icon: 'U', run: ({ editor }) => void editor.chain().focus().toggleUnderline().run() },
  { id: 'strike', icon: 'S', run: ({ editor }) => void editor.chain().focus().toggleStrike().run() },
  { id: 'highlight', icon: '▮', run: ({ editor }) => void editor.chain().focus().toggleHighlight().run() },
  { id: 'code', icon: '</>', run: ({ editor }) => void editor.chain().focus().toggleCode().run() },
  { id: 'codeblock', icon: '{ }', run: ({ editor }) => void editor.chain().focus().toggleCodeBlock().run() },
  { id: 'link', icon: '🔗', run: ({ api }) => api.openLinkEditor() },
  { id: 'list', icon: '•', run: ({ editor }) => void editor.chain().focus().toggleBulletList().run() },
  { id: 'numbered', icon: '1.', run: ({ editor }) => void editor.chain().focus().toggleOrderedList().run() },
  { id: 'quote', icon: '❝', run: ({ editor }) => void editor.chain().focus().toggleBlockquote().run() },
  { id: 'divider', icon: '―', run: ({ editor }) => void editor.chain().focus().setHorizontalRule().run() },
  { id: 'attach', icon: '📎', run: ({ api }) => api.pickFiles() },
  { id: 'audio', icon: '🎙', run: ({ api }) => api.startRecording('audio') },
  { id: 'video', icon: '🎥', run: ({ api }) => api.startRecording('video') },
  { id: 'direction', icon: '⇄', run: ({ api }) => api.toggleDirection() },
];

/** Merge command lists; later entries override earlier ones with the same id. */
export const mergeCommands = (base: SlashCommand[], extra: SlashCommand[] = []): SlashCommand[] => {
  const map = new Map<string, SlashCommand>();
  for (const c of [...base, ...extra]) map.set(c.id, c);
  return [...map.values()];
};
