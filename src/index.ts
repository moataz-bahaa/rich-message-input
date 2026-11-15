export { TextInput } from './TextInput';
export { Preview } from './Preview';

export { defaultSlashCommands, mergeCommands } from './commands';
export { EMPTY_DOCUMENT, toPlainText, isDocumentEmpty, getAttachments } from './content';
export { en, ar, locales, resolveMessages } from './i18n';
export { DEFAULT_TOOLBAR } from './components/Toolbar';

export { Attachment } from './extensions/attachment';
export { Direction as DirectionExtension } from './extensions/direction';
export { SlashCommands } from './extensions/slash-command';
export type { SlashItem, SlashMenuState, SlashOptions } from './extensions/slash-command';

export type { PreviewSlot, SlotClassNames, SlotStyles, TextInputSlot } from './slots';
export type {
  AttachmentData,
  AttachmentKind,
  DeepPartial,
  Direction,
  DirectionSetting,
  EditorApi,
  LocaleCode,
  Messages,
  PreviewProps,
  RecordingKind,
  RichTextDocument,
  RichTextMark,
  RichTextNode,
  SlashCommand,
  SlashCommandContext,
  TextInputHandle,
  TextInputProps,
  ToolbarItemId,
  UploadHandler,
} from './types';
