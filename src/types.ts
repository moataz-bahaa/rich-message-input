import type { Editor, Extensions, Range } from '@tiptap/core';
import type { CSSProperties, ReactNode } from 'react';
import type { PreviewSlot, SlotClassNames, SlotStyles, TextInputSlot } from './slots';

/* ---------------------------------------------------------------- content */

export type RichTextMark = {
  type: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'highlight' | 'link' | (string & {});
  attrs?: Record<string, unknown>;
};

/**
 * The serializable document format shared by <TextInput /> and <Preview />.
 * It is ProseMirror/Tiptap JSON, so it can be stored as-is in any database.
 */
export type RichTextNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
};

export type RichTextDocument = RichTextNode & { type: 'doc' };

export type AttachmentKind = 'file' | 'image' | 'audio' | 'video';

export type AttachmentData = {
  kind: AttachmentKind;
  /** URL (remote, blob: or data:) the attachment can be loaded from. */
  src: string;
  name?: string;
  size?: number;
  mimeType?: string;
  /** Duration in seconds, for recordings. */
  duration?: number;
  /** Optional id from your storage layer. */
  id?: string;
};

export type RecordingKind = 'audio' | 'video';

/* ------------------------------------------------------------------- i18n */

export type Direction = 'ltr' | 'rtl';
export type DirectionSetting = Direction | 'auto';
export type LocaleCode = 'en' | 'ar';

export type ToolbarItemId =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'highlight'
  | 'link'
  | 'bulletList'
  | 'orderedList'
  | 'codeBlock'
  | 'divider'
  | 'attach'
  | 'audio'
  | 'video'
  | 'direction';

export type Messages = {
  placeholder: string;
  send: string;
  toolbar: Record<ToolbarItemId, string> & { toolbarLabel: string };
  link: { title: string; urlLabel: string; urlPlaceholder: string; apply: string; remove: string; cancel: string };
  slash: { menuLabel: string; noResults: string };
  commands: Record<string, { title: string; description: string; keywords?: string[] }>;
  recording: { audio: string; video: string; stop: string; cancel: string; unsupported: string; denied: string; failed: string };
  attachment: { remove: string; uploading: string; uploadFailed: string };
};

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/* ----------------------------------------------------------------- slash */

export type EditorApi = {
  openLinkEditor: () => void;
  pickFiles: () => void;
  startRecording: (kind: RecordingKind) => void;
  insertAttachment: (data: AttachmentData) => void;
  toggleDirection: () => void;
};

export type SlashCommandContext = {
  editor: Editor;
  /** Range of the typed "/query" text. It is already deleted when `run` is called. */
  range: Range;
  /** Editor-level utilities for commands that need UI. */
  api: EditorApi;
};

export type SlashCommand = {
  /** Unique id; registering the same id twice overrides the earlier command. */
  id: string;
  /** Display title. Overrides the localized title when given. */
  title?: string;
  description?: string;
  /** Extra search terms. */
  keywords?: string[];
  /** Small text/emoji/ReactNode icon shown in the menu. */
  icon?: ReactNode;
  run: (ctx: SlashCommandContext) => void;
};

/* ------------------------------------------------------------------ props */

export type UploadHandler = (
  file: File | Blob,
  meta: { kind: AttachmentKind; name?: string; duration?: number },
) => Promise<AttachmentData> | AttachmentData;

export type TextInputHandle = {
  editor: Editor | null;
  focus: () => void;
  clear: () => void;
  getDocument: () => RichTextDocument;
  setDocument: (doc: RichTextDocument) => void;
  isEmpty: () => boolean;
};

export type TextInputProps = {
  /** Controlled value. Pair with `onChange`. */
  value?: RichTextDocument | null;
  /** Initial value for uncontrolled usage. */
  defaultValue?: RichTextDocument | null;
  onChange?: (doc: RichTextDocument) => void;
  /** Called on Enter (when `submitOnEnter`) or Mod+Enter, and by the send button. */
  onSubmit?: (doc: RichTextDocument) => void;
  /** Enter sends, Shift+Enter inserts a line break. Lists and code blocks keep Enter. */
  submitOnEnter?: boolean;
  hideSendButton?: boolean;

  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Applied to the root element (same as `classNames.root` / `styles.root`). */
  className?: string;
  style?: CSSProperties;
  /** Extra class per part, e.g. `{ toolbar: 'my-toolbar', sendButton: 'btn' }`. */
  classNames?: SlotClassNames<TextInputSlot>;
  /** Inline styles per part. Always win over stylesheet rules. */
  styles?: SlotStyles<TextInputSlot>;
  /** `light`, `dark`, or `auto` (follows prefers-color-scheme). Default `auto`. */
  theme?: 'light' | 'dark' | 'auto';
  /** Editor area height bounds in px; it scrolls past maxHeight. */
  minHeight?: number;
  maxHeight?: number;

  /* i18n / direction */
  locale?: LocaleCode;
  messages?: DeepPartial<Messages>;
  /** Content direction. `auto` detects per paragraph (mixed English/Arabic). */
  direction?: DirectionSetting;
  defaultDirection?: DirectionSetting;
  onDirectionChange?: (direction: DirectionSetting) => void;

  /* tools */
  /** Toolbar items in order. `false` hides the toolbar. */
  toolbar?: ToolbarItemId[] | false;
  /** Replace the built-in slash commands entirely. */
  commands?: SlashCommand[];
  /** Add (or override by id) slash commands on top of the defaults. */
  extraCommands?: SlashCommand[];
  disableSlashCommands?: boolean;
  /** Additional Tiptap extensions. */
  extensions?: Extensions;
  /** `accept` attribute for the file picker. */
  accept?: string;
  /** Files larger than this (bytes) are rejected via `onError`. */
  maxFileSize?: number;

  /* media */
  /**
   * Upload hook for files and recordings. Return the stored attachment data.
   * Without it, attachments use local blob: URLs (fine for demos, not for persistence).
   */
  onUpload?: UploadHandler;
  onFilesAdded?: (files: File[]) => void;
  onRecordingComplete?: (blob: Blob, info: { kind: RecordingKind; duration: number; mimeType: string }) => void;
  onError?: (error: Error) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export type PreviewProps = {
  value: RichTextDocument | null | undefined;
  direction?: DirectionSetting;
  locale?: LocaleCode;
  className?: string;
  style?: CSSProperties;
  classNames?: SlotClassNames<PreviewSlot>;
  styles?: SlotStyles<PreviewSlot>;
  theme?: 'light' | 'dark' | 'auto';
  /** Override rendering of attachments (e.g. signed URLs, lightbox). */
  renderAttachment?: (data: AttachmentData, defaultNode: ReactNode) => ReactNode;
};
