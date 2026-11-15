import { Extension, type Editor, type Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { Suggestion } from '@tiptap/suggestion';

export type SlashItem = { id: string; title: string; description: string; icon?: unknown; keywords: string[]; run: (range: Range) => void };

export type SlashMenuState = {
  items: SlashItem[];
  clientRect: (() => DOMRect | null) | null;
  command: (item: SlashItem) => void;
};

export type SlashOptions = {
  /** Return the matching items for a query (called on every keystroke). */
  getItems: (query: string) => SlashItem[];
  /** Menu lifecycle callbacks; `null` means closed. */
  onState: (state: SlashMenuState | null) => void;
  /** Arrow/Enter/Escape handler owned by the React menu. Return true when handled. */
  onKeyDown: (event: KeyboardEvent) => boolean;
};

export const slashKey = new PluginKey('rteSlash');

export const SlashCommands = Extension.create<SlashOptions>({
  name: 'slashCommands',

  // run before the Enter/Arrow keymaps so the open menu wins
  priority: 1000,

  addOptions() {
    return { getItems: () => [], onState: () => {}, onKeyDown: () => false };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    return [
      Suggestion<SlashItem, SlashItem>({
        pluginKey: slashKey,
        editor: this.editor as Editor,
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return $from.parent.type.name !== 'codeBlock';
        },
        items: ({ query }) => options.getItems(query),
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashItem }) => {
          editor.chain().focus().deleteRange(range).run();
          props.run(range);
        },
        render: () => ({
          onStart: (props) => {
            options.onState({ items: props.items, clientRect: props.clientRect ?? null, command: props.command });
          },
          onUpdate: (props) => {
            options.onState({ items: props.items, clientRect: props.clientRect ?? null, command: props.command });
          },
          onKeyDown: ({ event }) => options.onKeyDown(event),
          onExit: () => options.onState(null),
        }),
      }),
    ];
  },
});
