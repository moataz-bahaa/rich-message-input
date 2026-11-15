import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import { toError } from '../lib/errors';
import { kindFromMime, recordingFileName, sizeError, validateFile, type FileRules } from '../lib/files';
import { useLatest } from '../lib/useLatest';
import type { RecorderResult } from '../media/useRecorder';
import type { AttachmentData, UploadHandler } from '../types';

type Options = FileRules & {
  onUpload?: UploadHandler;
  onFilesAdded?: (files: File[]) => void;
  onError: (error: Error) => void;
};

type StoreMeta = Parameters<UploadHandler>[1];

/** Validates, stores (via `onUpload`, or a local blob URL) and inserts attachments into the editor. */
export const useAttachments = (editorRef: RefObject<Editor | null>, options: Options) => {
  const latest = useLatest(options);
  const [pending, setPending] = useState(0);
  const pendingRef = useRef(0);
  const objectUrls = useRef<string[]>([]);

  // Local blob URLs live as long as the editor does.
  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current = [];
    },
    [],
  );

  /** Adjust the in-flight counter synchronously so the send guard never sees a gap between files. */
  const track = useCallback((delta: number) => {
    pendingRef.current += delta;
    setPending(pendingRef.current);
  }, []);

  const store = useCallback(
    async (source: File | Blob, meta: StoreMeta): Promise<AttachmentData> => {
      const { onUpload } = latest.current;
      if (onUpload) return onUpload(source, meta);
      const src = URL.createObjectURL(source);
      objectUrls.current.push(src);
      return { kind: meta.kind, src, name: meta.name, size: source.size, mimeType: source.type, duration: meta.duration };
    },
    [latest],
  );

  /** Callers must reserve a slot with `track(1)` first; it is released here when the upload settles. */
  const attach = useCallback(
    async (source: File | Blob, meta: StoreMeta) => {
      try {
        const data = await store(source, meta);
        editorRef.current?.chain().focus().insertAttachment(data).run();
      } catch (error) {
        latest.current.onError(toError(error));
      } finally {
        track(-1);
      }
    },
    [store, editorRef, latest, track],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      const { onFilesAdded, onError, accept, maxFileSize } = latest.current;
      const accepted = files.filter((file) => {
        const problem = validateFile(file, { accept, maxFileSize });
        if (problem) onError(new Error(problem));
        return problem === null;
      });
      if (accepted.length === 0) return;
      onFilesAdded?.(accepted);
      track(accepted.length);
      for (const file of accepted) await attach(file, { kind: kindFromMime(file.type), name: file.name });
    },
    [attach, latest, track],
  );

  const addRecording = useCallback(
    async ({ blob, kind, duration, mimeType }: RecorderResult) => {
      const name = recordingFileName(kind, mimeType);
      const problem = sizeError(name, blob.size, latest.current.maxFileSize);
      if (problem) {
        latest.current.onError(new Error(problem));
        return;
      }
      track(1);
      await attach(blob, { kind, name, duration });
    },
    [attach, latest, track],
  );

  const isUploading = useCallback(() => pendingRef.current > 0, []);

  return { pending, isUploading, addFiles, addRecording };
};
