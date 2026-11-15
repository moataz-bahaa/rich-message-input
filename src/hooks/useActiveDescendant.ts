import { useEffect } from 'react';
import type { Editor } from '@tiptap/core';

/** Points the editor at the highlighted option so screen readers follow the slash menu. */
export const useActiveDescendant = (editor: Editor | null, optionId: string | null) => {
  useEffect(() => {
    const dom = editor?.view.dom;
    if (!dom) return;
    if (optionId) dom.setAttribute('aria-activedescendant', optionId);
    else dom.removeAttribute('aria-activedescendant');
    return () => dom.removeAttribute('aria-activedescendant');
  }, [editor, optionId]);
};
