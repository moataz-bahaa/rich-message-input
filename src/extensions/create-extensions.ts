import type { Extensions } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import type { DirectionSetting } from '../types';
import { Attachment } from './attachment';
import { Direction } from './direction';
import { createEditorShortcuts, type ShortcutHandlers } from './keyboard-shortcuts';
import { SlashCommands, type SlashOptions } from './slash-command';

type Options = {
  direction: DirectionSetting;
  getPlaceholder: () => string;
  slash: SlashOptions;
  shortcuts: ShortcutHandlers;
  /** Consumer-provided extensions, appended last so they can override ours. */
  extra?: Extensions;
};

export const createExtensions = ({ direction, getPlaceholder, slash, shortcuts, extra = [] }: Options): Extensions => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } },
  }),
  Highlight,
  Placeholder.configure({ placeholder: getPlaceholder }),
  Attachment,
  Direction.configure({ direction }),
  SlashCommands.configure(slash),
  createEditorShortcuts(shortcuts),
  ...extra,
];
