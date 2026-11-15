import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const DIRECTION_EXTENSION_NAME = 'direction';

export const directionKey = new PluginKey('rteDirection');

const DIR_NODES = new Set(['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'blockquote']);

/**
 * Adds a `dir` decoration to block nodes (not stored in the document).
 * `auto` lets the browser pick LTR/RTL per block from its first strong character,
 * which is what makes mixed English/Arabic messages behave.
 */
export const Direction = Extension.create<{ direction: 'ltr' | 'rtl' | 'auto' }>({
  name: DIRECTION_EXTENSION_NAME,

  addOptions() {
    return { direction: 'auto' };
  },

  addStorage() {
    return { direction: this.options.direction, fallback: 'ltr' as 'ltr' | 'rtl' };
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    return [
      new Plugin({
        key: directionKey,
        props: {
          decorations(state) {
            const dir = storage.direction;
            const decos: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'codeBlock') {
                decos.push(Decoration.node(pos, pos + node.nodeSize, { dir: 'ltr' }));
                return false;
              }
              if (DIR_NODES.has(node.type.name)) {
                // empty blocks have no strong character yet: fall back to the UI direction
                const value = dir === 'auto' && node.isTextblock && node.content.size === 0 ? storage.fallback : dir;
                decos.push(Decoration.node(pos, pos + node.nodeSize, { dir: value }));
              }
              return true;
            });
            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },
});

type DirectionStorage = { direction: 'ltr' | 'rtl' | 'auto'; fallback: 'ltr' | 'rtl' };

/** Update the direction used by the decoration plugin and force it to re-run. */
export const syncDirection = (editor: Editor, direction: DirectionStorage['direction'], fallback: DirectionStorage['fallback']) => {
  const storage = (editor.storage as unknown as Record<string, DirectionStorage>)[DIRECTION_EXTENSION_NAME];
  if (!storage) return;
  storage.direction = direction;
  storage.fallback = fallback;
  editor.view.dispatch(editor.state.tr.setMeta(directionKey, direction));
};
