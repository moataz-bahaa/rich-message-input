import { Extension, type Editor } from '@tiptap/core';

export type ShortcutHandlers = {
  /** Sends the message. Returns false when there is nothing to send it to. */
  submit: () => boolean;
  submitOnEnter: () => boolean;
  openLinkEditor: () => void;
};

const isInStructuredBlock = (editor: Editor) =>
  editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('codeBlock');

/** A new line is a new block, so heading/list changes only affect the current line. */
const splitLine = (editor: Editor): boolean => {
  if (editor.isActive('codeBlock')) return false;
  return editor.commands.first(({ commands }) => [() => commands.splitListItem('listItem'), () => commands.splitBlock()]);
};

export const createEditorShortcuts = ({ submit, submitOnEnter, openLinkEditor }: ShortcutHandlers) =>
  Extension.create({
    name: 'editorShortcuts',
    priority: 200, // above HardBreak's Shift-Enter

    addKeyboardShortcuts: () => ({
      'Mod-Enter': () => submit(),
      Enter: ({ editor }) => (submitOnEnter() && !isInStructuredBlock(editor) ? submit() : false),
      'Shift-Enter': ({ editor }) => splitLine(editor),
      'Mod-k': () => {
        openLinkEditor();
        return true;
      },
    }),
  });
