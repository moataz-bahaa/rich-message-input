import type { AttachmentKind, RecordingKind } from '../types';

export type FileRules = { accept?: string; maxFileSize?: number };

export const kindFromMime = (mime: string): AttachmentKind => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
};

const matchesAcceptRule = (file: File, rawRule: string): boolean => {
  const rule = rawRule.trim().toLowerCase();
  if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
  if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
  return rule !== '' && file.type.toLowerCase() === rule;
};

/** Mirrors the semantics of the HTML `accept` attribute. */
export const matchesAccept = (file: File, accept: string): boolean =>
  accept.split(',').some((rule) => matchesAcceptRule(file, rule));

export const sizeError = (label: string, size: number, maxFileSize?: number): string | null =>
  maxFileSize && size > maxFileSize ? `"${label}" exceeds the maximum file size` : null;

/** Returns a human-readable reason when the file must be rejected, otherwise null. */
export const validateFile = (file: File, { accept, maxFileSize }: FileRules): string | null => {
  if (accept && !matchesAccept(file, accept)) return `"${file.name}" is not an accepted file type`;
  return sizeError(file.name, file.size, maxFileSize);
};

const recordingExtension = (kind: RecordingKind, mimeType: string): string => {
  if (mimeType.includes('mp4')) return kind === 'audio' ? 'm4a' : 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
};

export const recordingFileName = (kind: RecordingKind, mimeType: string): string =>
  `${kind === 'audio' ? 'voice-message' : 'video-clip'}.${recordingExtension(kind, mimeType)}`;
