import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { defaultSlashCommands, mergeCommands } from './commands';
import { Footer } from './components/Footer';
import { LinkEditor } from './components/LinkEditor';
import { RecorderPanel } from './components/RecorderPanel';
import { SlashMenu } from './components/SlashMenu';
import { DEFAULT_TOOLBAR, Toolbar } from './components/Toolbar';
import { EMPTY_DOCUMENT, isDocumentEmpty } from './content';
import { createFileHandlers } from './editor-props';
import { createExtensions } from './extensions/create-extensions';
import { useActiveDescendant } from './hooks/useActiveDescendant';
import { useAttachments } from './hooks/useAttachments';
import { useControlledValue } from './hooks/useControlledValue';
import { useDirection, useDirectionSync } from './hooks/useDirection';
import { useErrorReporter } from './hooks/useErrorReporter';
import { useMediaRecording } from './hooks/useMediaRecording';
import { useSlashMenu } from './hooks/useSlashMenu';
import { useTextInputHandle } from './hooks/useTextInputHandle';
import { resolveMessages } from './i18n';
import { useLatest } from './lib/useLatest';
import { applyLink, getLinkHref, removeLink } from './link-actions';
import { createSlashItems, filterSlashItems } from './slash-items';
import { cx, slotProps, SlotsProvider, toCssText } from './slots';
import type { EditorApi, RichTextDocument, TextInputHandle, TextInputProps } from './types';

export const TextInput = forwardRef<TextInputHandle, TextInputProps>(function TextInput(props, ref) {
  const {
    value,
    defaultValue,
    placeholder,
    disabled = false,
    autoFocus = false,
    className,
    style,
    classNames,
    styles,
    theme = 'auto',
    minHeight = 56,
    maxHeight = 320,
    locale = 'en',
    toolbar = DEFAULT_TOOLBAR,
    disableSlashCommands = false,
    hideSendButton = false,
    accept,
  } = props;

  const slashIdPrefix = `rte-slash-${useId()}`;
  const latestProps = useLatest(props);
  const editorRef = useRef<Editor | null>(null);
  const apiRef = useRef<EditorApi | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(() => isDocumentEmpty(value ?? defaultValue));

  const messages = useMemo(
    () => resolveMessages(locale, { ...props.messages, ...(placeholder ? { placeholder } : {}) }),
    [locale, props.messages, placeholder],
  );
  const messagesRef = useLatest(messages);

  const { direction, chromeDirection, toggle: toggleDirection } = useDirection({
    direction: props.direction,
    defaultDirection: props.defaultDirection,
    locale,
    onChange: props.onDirectionChange,
  });

  const reportError = useErrorReporter(props.onError);
  const attachments = useAttachments(editorRef, {
    onUpload: props.onUpload,
    onFilesAdded: props.onFilesAdded,
    accept,
    maxFileSize: props.maxFileSize,
    onError: reportError,
  });
  const recorder = useMediaRecording({
    messages: messages.recording,
    onRecordingComplete: props.onRecordingComplete,
    addRecording: attachments.addRecording,
    reportError,
  });

  /* ---- slash commands ---- */
  const commands = useMemo(
    () => mergeCommands(props.commands ?? defaultSlashCommands, props.extraCommands),
    [props.commands, props.extraCommands],
  );
  const commandsRef = useLatest(commands);

  const getSlashItems = useCallback(
    (query: string) => {
      if (latestProps.current.disableSlashCommands) return [];
      const items = createSlashItems(commandsRef.current, messagesRef.current.commands, (command, range) => {
        const editor = editorRef.current;
        const api = apiRef.current;
        if (editor && api) command.run({ editor, range, api });
      });
      return filterSlashItems(items, query);
    },
    [latestProps, commandsRef, messagesRef],
  );
  const slash = useSlashMenu({ getItems: getSlashItems });

  /* ---- sending ---- */
  /** Returns false when there is no `onSubmit`; empty or still-uploading messages are swallowed. */
  const submitMessage = useCallback((): boolean => {
    const { onSubmit, value: controlledValue } = latestProps.current;
    const editor = editorRef.current;
    if (!onSubmit || !editor) return false;

    const doc = editor.getJSON() as RichTextDocument;
    if (isDocumentEmpty(doc) || attachments.isUploading()) return true;

    onSubmit(doc);
    if (controlledValue === undefined) editor.commands.clearContent(true);
    return true;
  }, [latestProps, attachments]);

  /* ---- editor ---- */
  const [extensions] = useState(() =>
    createExtensions({
      direction,
      getPlaceholder: () => messagesRef.current.placeholder,
      slash: slash.extensionOptions,
      shortcuts: {
        submit: submitMessage,
        submitOnEnter: () => Boolean(latestProps.current.submitOnEnter),
        openLinkEditor: () => apiRef.current?.openLinkEditor(),
      },
      extra: props.extensions,
    }),
  );

  const fileHandlers = useMemo(() => createFileHandlers((files) => void attachments.addFiles(files)), [attachments.addFiles]);

  const slots = useMemo(() => ({ classNames, styles }), [classNames, styles]);
  const editorAttributes = useMemo(() => {
    const { className: editorClass, style: editorStyle } = slotProps(slots, 'editor', 'rte-content');
    return { class: editorClass ?? '', 'data-rte-slot': 'editor', ...(editorStyle ? { style: toCssText(editorStyle) ?? '' } : {}) };
  }, [slots]);

  const editor = useEditor({
    extensions,
    content: value ?? defaultValue ?? EMPTY_DOCUMENT,
    editable: !disabled,
    autofocus: autoFocus ? 'end' : false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        ...editorAttributes,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': messages.placeholder,
        spellcheck: 'true',
      },
      ...fileHandlers,
    },
    onUpdate: ({ editor: updated }) => {
      const doc = updated.getJSON() as RichTextDocument;
      setIsEmpty(isDocumentEmpty(doc));
      latestProps.current.onChange?.(doc);
    },
    onFocus: () => latestProps.current.onFocus?.(),
    onBlur: () => latestProps.current.onBlur?.(),
  });
  editorRef.current = editor;

  useControlledValue(editor, value, setIsEmpty);
  useDirectionSync(editor, direction, chromeDirection);
  useTextInputHandle(ref, editor);
  const activeItem = slash.menu?.items[slash.selected];
  useActiveDescendant(editor, activeItem ? `${slashIdPrefix}-${activeItem.id}` : null);
  useEffect(() => editor?.setEditable(!disabled, false), [editor, disabled]);

  apiRef.current = useMemo<EditorApi>(
    () => ({
      openLinkEditor: () => setLinkEditorOpen(true),
      pickFiles: () => fileInputRef.current?.click(),
      startRecording: (kind) => void recorder.start(kind),
      insertAttachment: (data) => void editorRef.current?.chain().focus().insertAttachment(data).run(),
      toggleDirection,
    }),
    [recorder.start, toggleDirection],
  );

  /* ---- handlers ---- */
  const closeLinkEditor = () => {
    setLinkEditorOpen(false);
    editor?.commands.focus();
  };

  const handleFilesPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length > 0) void attachments.addFiles(files);
  };

  const recording = recorder.state.status === 'recording' ? recorder.state : null;
  const canSend = !disabled && !isEmpty && attachments.pending === 0;

  const root = slotProps(slots, 'root', 'rte-root');
  const scroll = slotProps(slots, 'scroll', 'rte-scroll');

  return (
    <SlotsProvider value={slots}>
      <div
        {...root}
        className={cx(root.className, className)}
        style={{ ...root.style, ...style, ['--rte-min-height' as string]: `${minHeight}px`, ['--rte-max-height' as string]: `${maxHeight}px` }}
        dir={chromeDirection}
        data-theme={theme === 'auto' ? undefined : theme}
        data-disabled={disabled || undefined}
      >
        {toolbar && editor && (
          <Toolbar editor={editor} items={toolbar} messages={messages} api={apiRef.current!} disabled={disabled} />
        )}

        {linkEditorOpen && editor && (
          <LinkEditor
            initialUrl={getLinkHref(editor)}
            hasLink={editor.isActive('link')}
            messages={messages.link}
            onApply={(url) => {
              setLinkEditorOpen(false);
              applyLink(editor, url);
            }}
            onRemove={() => {
              setLinkEditorOpen(false);
              removeLink(editor);
            }}
            onCancel={closeLinkEditor}
          />
        )}

        <div {...scroll}>
          <EditorContent editor={editor} />
        </div>

        {recording && <RecorderPanel state={recording} messages={messages.recording} onStop={recorder.stop} onCancel={recorder.cancel} />}

        <Footer
          statusText={attachments.pending > 0 ? messages.attachment.uploading : ''}
          onSend={hideSendButton || !props.onSubmit ? undefined : submitMessage}
          sendDisabled={!canSend}
          sendLabel={messages.send}
        />

        <input ref={fileInputRef} type="file" multiple hidden accept={accept} onChange={handleFilesPicked} />

        {!disableSlashCommands && slash.menu && (
          <SlashMenu
            items={slash.menu.items}
            selected={slash.selected}
            getAnchor={slash.menu.clientRect}
            idPrefix={slashIdPrefix}
            dir={chromeDirection}
            theme={theme}
            label={messages.slash.menuLabel}
            onSelect={slash.menu.command}
            onHover={slash.setSelected}
          />
        )}
      </div>
    </SlotsProvider>
  );
});
