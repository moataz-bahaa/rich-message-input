import { Node, mergeAttributes } from '@tiptap/core';
import { NodeSelection, Selection } from '@tiptap/pm/state';
import { formatBytes, sanitizeSrc } from '../content';
import type { AttachmentData } from '../types';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    attachment: {
      insertAttachment: (data: AttachmentData) => ReturnType;
    };
  }
}

/** Block-level atom holding a file / image / audio / video reference. */
export const Attachment = Node.create({
  name: 'attachment',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    const attr = (name: string, def: unknown = null) => ({
      default: def,
      parseHTML: (el: HTMLElement) => el.getAttribute(`data-${name}`),
      renderHTML: (attrs: Record<string, unknown>) => (attrs[name] == null ? {} : { [`data-${name}`]: String(attrs[name]) }),
    });
    return {
      kind: attr('kind', 'file'),
      src: attr('src'),
      name: attr('name'),
      size: attr('size'),
      mimeType: attr('mimeType'),
      duration: attr('duration'),
      id: attr('id'),
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-rte-attachment]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { kind, name, size } = node.attrs as { kind: string; name: string | null; size: string | number | null };
    const src = sanitizeSrc(node.attrs.src);
    const wrapper = mergeAttributes(HTMLAttributes, { 'data-rte-attachment': '', class: `rte-attachment rte-attachment--${kind}` });
    if (!src) return ['div', wrapper];
    if (kind === 'image') return ['div', wrapper, ['img', { src, alt: name ?? '' }]];
    if (kind === 'audio') return ['div', wrapper, ['audio', { src, controls: 'true', preload: 'metadata' }]];
    if (kind === 'video') return ['div', wrapper, ['video', { src, controls: 'true', preload: 'metadata' }]];
    return [
      'div',
      wrapper,
      [
        'a',
        { href: src, download: name ?? '', rel: 'noopener noreferrer' },
        ['span', { class: 'rte-attachment__name' }, name ?? src],
        ['span', { class: 'rte-attachment__meta' }, size == null ? '' : formatBytes(Number(size))],
      ],
    ];
  },

  addCommands() {
    return {
      insertAttachment:
        (data) =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs: data })
            // An inserted atom stays selected, so the next insert would replace it.
            // Move the caret to a paragraph after it (creating one if needed).
            .command(({ tr, dispatch }) => {
              const { selection } = tr;
              if (!(selection instanceof NodeSelection) || selection.node.type.name !== this.name) return true;
              if (!dispatch) return true;
              const after = selection.to;
              if (!tr.doc.resolve(after).nodeAfter) tr.insert(after, tr.doc.type.schema.nodes.paragraph!.create());
              tr.setSelection(Selection.near(tr.doc.resolve(after), 1));
              return true;
            })
            .run(),
    };
  },
});
