import type { Editor } from '@tiptap/core';
import { normalizeUrl } from './content';

export const getLinkHref = (editor: Editor): string => (editor.getAttributes('link').href as string | undefined) ?? '';

export const removeLink = (editor: Editor) => {
  editor.chain().focus().extendMarkRange('link').unsetLink().run();
};

/** Links the selection, edits the link under the caret, or inserts the typed URL as linked text. */
export const applyLink = (editor: Editor, input: string) => {
  const href = normalizeUrl(input);
  if (!href) return removeLink(editor);

  const hasTarget = !editor.state.selection.empty || editor.isActive('link');
  if (hasTarget) {
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    return;
  }

  editor
    .chain()
    .focus()
    .insertContent({ type: 'text', text: input.trim(), marks: [{ type: 'link', attrs: { href } }] })
    .insertContent(' ')
    .run();
};
