import { useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { isDocumentEmpty } from '../content';
import type { RichTextDocument } from '../types';

/** Structural comparison, so key order and default attrs in the incoming JSON don't matter. */
const isSameDocument = (editor: Editor, value: RichTextDocument): boolean => {
  try {
    return editor.state.doc.eq(Node.fromJSON(editor.schema, value));
  } catch {
    return false;
  }
};

/** Mirrors a controlled `value` into the editor without echoing it back through `onChange`. */
export const useControlledValue = (
  editor: Editor | null,
  value: RichTextDocument | null | undefined,
  onEmptyChange: (empty: boolean) => void,
) => {
  const isControlled = value !== undefined;

  useEffect(() => {
    if (!editor || !isControlled) return;
    if (value) {
      if (isSameDocument(editor, value)) return;
      editor.commands.setContent(value, { emitUpdate: false });
      onEmptyChange(isDocumentEmpty(value));
    } else if (!isDocumentEmpty(editor.getJSON())) {
      editor.commands.clearContent(false);
      onEmptyChange(true);
    }
  }, [editor, value, isControlled, onEmptyChange]);
};
