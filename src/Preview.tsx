import { createElement, Fragment, type ReactNode } from 'react';
import { formatBytes, sanitizeHref, toAttachmentData } from './content';
import { resolveDirection } from './i18n';
import { cx, slotProps, type PreviewSlot, type SlotConfig } from './slots';
import type { AttachmentData, PreviewProps, RichTextMark, RichTextNode } from './types';

type Ctx = { dir: string; slots: SlotConfig<PreviewSlot>; renderAttachment?: PreviewProps['renderAttachment'] };

const renderMarks = (text: string, marks: RichTextMark[] = []): ReactNode => {
  let node: ReactNode = text;
  // wrap inside-out so `link` ends up outermost
  const order = ['code', 'highlight', 'strike', 'underline', 'italic', 'bold', 'link'];
  const sorted = [...marks].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  for (const mark of sorted) {
    switch (mark.type) {
      case 'bold': node = <strong>{node}</strong>; break;
      case 'italic': node = <em>{node}</em>; break;
      case 'underline': node = <u>{node}</u>; break;
      case 'strike': node = <s>{node}</s>; break;
      case 'code': node = <code>{node}</code>; break;
      case 'highlight': node = <mark>{node}</mark>; break;
      case 'link': {
        const href = sanitizeHref(mark.attrs?.href);
        if (href) node = <a href={href} target="_blank" rel="noopener noreferrer nofollow">{node}</a>;
        break;
      }
      default: break;
    }
  }
  return node;
};

const renderAttachment = (data: AttachmentData, ctx: Ctx): ReactNode => {
  const slot = slotProps(ctx.slots, 'attachment', `rte-attachment rte-attachment--${data.kind}`);
  let node: ReactNode;
  switch (data.kind) {
    case 'image': node = <div {...slot}><img src={data.src} alt={data.name ?? ''} loading="lazy" /></div>; break;
    case 'audio': node = <div {...slot}><audio src={data.src} controls preload="metadata" /></div>; break;
    case 'video': node = <div {...slot}><video src={data.src} controls preload="metadata" /></div>; break;
    default:
      node = (
        <div {...slot}>
          <a href={data.src} download={data.name ?? ''} rel="noopener noreferrer">
            <span className="rte-attachment__name">{data.name ?? data.src}</span>
            <span className="rte-attachment__meta">{data.size == null ? '' : formatBytes(data.size)}</span>
          </a>
        </div>
      );
  }
  return ctx.renderAttachment ? ctx.renderAttachment(data, node) : node;
};

const renderChildren = (nodes: RichTextNode[] | undefined, ctx: Ctx): ReactNode =>
  (nodes ?? []).map((child, i) => <Fragment key={i}>{renderNode(child, ctx)}</Fragment>);

const renderNode = (node: RichTextNode, ctx: Ctx): ReactNode => {
  const dir = { dir: ctx.dir };
  switch (node.type) {
    case 'text': return renderMarks(node.text ?? '', node.marks);
    case 'paragraph': return <p {...dir}>{renderChildren(node.content, ctx)}</p>;
    case 'heading': {
      const level = Math.min(3, Math.max(1, Number(node.attrs?.level) || 1));
      return createElement(`h${level}`, dir, renderChildren(node.content, ctx));
    }
    case 'bulletList': return <ul {...dir}>{renderChildren(node.content, ctx)}</ul>;
    case 'orderedList': {
      const start = Number(node.attrs?.start);
      return <ol {...dir} start={start > 1 ? start : undefined}>{renderChildren(node.content, ctx)}</ol>;
    }
    case 'listItem': return <li {...dir}>{renderChildren(node.content, ctx)}</li>;
    case 'blockquote': return <blockquote {...dir}>{renderChildren(node.content, ctx)}</blockquote>;
    case 'codeBlock':
      return <pre dir="ltr"><code>{(node.content ?? []).map((c) => c.text ?? '').join('')}</code></pre>;
    case 'horizontalRule': return <hr />;
    case 'hardBreak': return <br />;
    case 'attachment': {
      const data = toAttachmentData(node.attrs);
      return data ? renderAttachment(data, ctx) : null;
    }
    default:
      // unknown node types degrade to their children so newer documents still render
      return node.content ? <>{renderChildren(node.content, ctx)}</> : null;
  }
};

/** Read-only renderer for documents produced by <TextInput />. No editor runtime is loaded. */
export const Preview = ({ value, direction = 'auto', locale = 'en', className, style, classNames, styles, theme = 'auto', renderAttachment: custom }: PreviewProps) => {
  const slots = { classNames, styles };
  const root = slotProps(slots, 'root', 'rte-root rte-preview');
  const content = slotProps(slots, 'content', 'rte-content rte-content--preview');
  const chromeDir = resolveDirection(direction, locale);
  const blockDir = direction === 'auto' ? 'auto' : direction;
  return (
    <div
      {...root}
      className={cx(root.className, className)}
      style={{ ...root.style, ...style }}
      dir={chromeDir}
      data-theme={theme === 'auto' ? undefined : theme}
    >
      <div {...content}>{renderChildren(value?.content, { dir: blockDir, slots, renderAttachment: custom })}</div>
    </div>
  );
};
