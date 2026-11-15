import type { AttachmentData, RichTextDocument, RichTextNode } from './types';

export const EMPTY_DOCUMENT: RichTextDocument = { type: 'doc', content: [{ type: 'paragraph' }] };

/** Plain-text projection of a document (for notifications, search indexes, etc.). */
export const toPlainText = (doc: RichTextNode | null | undefined): string => {
  if (!doc) return '';
  const walk = (node: RichTextNode): string => {
    if (node.type === 'text') return node.text ?? '';
    if (node.type === 'hardBreak') return '\n';
    if (node.type === 'horizontalRule') return '---';
    if (node.type === 'attachment') return typeof node.attrs?.name === 'string' ? `[${node.attrs.name}]` : '[attachment]';
    const children = (node.content ?? []).map(walk);
    const isBlockContainer = ['doc', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(node.type);
    return children.join(isBlockContainer ? '\n' : '');
  };
  return walk(doc).trim();
};

/** True when the document has no text and no attachments/dividers. */
export const isDocumentEmpty = (doc: RichTextNode | null | undefined): boolean => {
  if (!doc) return true;
  const hasContent = (node: RichTextNode): boolean => {
    if (node.type === 'text') return Boolean(node.text?.trim());
    if (node.type === 'attachment' || node.type === 'horizontalRule') return true;
    return (node.content ?? []).some(hasContent);
  };
  return !hasContent(doc);
};

/** Collect every attachment referenced by a document (unsafe sources are dropped). */
export const getAttachments = (doc: RichTextNode | null | undefined): AttachmentData[] => {
  const found: AttachmentData[] = [];
  const walk = (node: RichTextNode) => {
    const data = node.type === 'attachment' ? toAttachmentData(node.attrs) : null;
    if (data) found.push(data);
    node.content?.forEach(walk);
  };
  if (doc) walk(doc);
  return found;
};

// "localhost:3000" looks like a scheme but is a host and port
const HOST_WITH_PORT = /^[^\s/?#:]+:\d+([/?#]|$)/;
const SAFE_PROTOCOL = /^(https?:|mailto:|tel:)/i;
// browsers ignore tabs, newlines and control characters inside a URL scheme
const stripControl = (v: string) => v.replace(/[\u0000-\u001f\u007f\s]/g, '');

/** Allow only http(s), mailto, tel and relative URLs. */
export const sanitizeHref = (href: unknown): string | undefined => {
  if (typeof href !== 'string') return undefined;
  const value = href.trim();
  const compact = stripControl(value);
  if (!compact) return undefined;
  if (SAFE_PROTOCOL.test(compact) || /^[/#?.]/.test(compact)) return value;
  return /^[a-z][a-z0-9+.-]*:/i.test(compact) ? undefined : value;
};

/** Like sanitizeHref, but also allows blob: and data:image|audio|video for attachment sources. */
export const sanitizeSrc = (src: unknown): string | undefined => {
  if (typeof src !== 'string') return undefined;
  const compact = stripControl(src);
  if (/^blob:/i.test(compact) || /^data:(image|audio|video)\//i.test(compact)) return src.trim();
  return sanitizeHref(src);
};

/** Normalize user-typed URLs: `example.com` becomes `https://example.com`. */
export const normalizeUrl = (input: string): string | undefined => {
  const value = input.trim();
  if (!value) return undefined;
  if (SAFE_PROTOCOL.test(value) || /^[/#?.]/.test(value)) return value;
  if (HOST_WITH_PORT.test(value)) return `https://${value}`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return undefined;
  return `https://${value}`;
};

export const formatBytes = (bytes: number | undefined): string => {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
};

export const formatDuration = (seconds: number | undefined): string => {
  if (seconds == null || Number.isNaN(seconds)) return '';
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Coerce stored attrs (which may be strings after HTML parsing) into AttachmentData. Unsafe sources are rejected. */
export const toAttachmentData = (attrs: Record<string, unknown> | undefined): AttachmentData | null => {
  const src = sanitizeSrc(attrs?.src);
  if (!attrs || !src) return null;
  const num = (v: unknown) => (v == null || v === '' ? undefined : Number(v));
  const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
  const kind = ['file', 'image', 'audio', 'video'].includes(attrs.kind as string) ? (attrs.kind as AttachmentData['kind']) : 'file';
  return { kind, src, name: str(attrs.name), size: num(attrs.size), mimeType: str(attrs.mimeType), duration: num(attrs.duration), id: str(attrs.id) };
};
