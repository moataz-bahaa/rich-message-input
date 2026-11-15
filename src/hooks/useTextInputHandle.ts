import { useImperativeHandle, type Ref } from 'react';
import type { Editor } from '@tiptap/core';
import { EMPTY_DOCUMENT, isDocumentEmpty } from '../content';
import type { RichTextDocument, TextInputHandle } from '../types';

/** Exposes the imperative API of <TextInput /> through its ref. */
export const useTextInputHandle = (ref: Ref<TextInputHandle>, editor: Editor | null) => {
  useImperativeHandle(
    ref,
    () => ({
      editor,
      focus: () => void editor?.commands.focus('end'),
      clear: () => void editor?.commands.clearContent(true),
      getDocument: () => (editor?.getJSON() as RichTextDocument | undefined) ?? EMPTY_DOCUMENT,
      setDocument: (doc) => void editor?.commands.setContent(doc, { emitUpdate: true }),
      isEmpty: () => isDocumentEmpty(editor?.getJSON()),
    }),
    [editor],
  );
};
