import type { EditorProps } from '@tiptap/pm/view';

const TEXT_TYPES = ['text/plain', 'text/html'];

type FileHandlers = Pick<EditorProps, 'handlePaste' | 'handleDrop'>;

/** Pasted or dropped files become attachments; pasted text/HTML keeps going through the schema parser. */
export const createFileHandlers = (onFiles: (files: File[]) => void): FileHandlers => ({
  handlePaste: (_view, event) => {
    const clipboard = event.clipboardData;
    const files = Array.from(clipboard?.files ?? []);
    // Apps like Excel put an image preview next to the text; the text wins.
    const hasText = clipboard?.types.some((type) => TEXT_TYPES.includes(type)) ?? false;
    if (files.length === 0 || hasText) return false;
    event.preventDefault();
    onFiles(files);
    return true;
  },

  handleDrop: (_view, event) => {
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length === 0) return false;
    event.preventDefault();
    onFiles(files);
    return true;
  },
});
