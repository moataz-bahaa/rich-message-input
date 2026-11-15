import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SlashItem } from '../extensions/slash-command';
import { useSlot } from '../slots';
import type { Direction } from '../types';

type Props = {
  items: SlashItem[];
  selected: number;
  /** Called when the menu is laid out; kept lazy so re-renders don't re-measure. */
  getAnchor: (() => DOMRect | null) | null;
  idPrefix: string;
  dir: Direction;
  theme: string;
  label: string;
  onSelect: (item: SlashItem) => void;
  onHover: (index: number) => void;
};

const DEFAULT_MENU_WIDTH = 280;
const GAP = 6;

export const SlashMenu = ({ items, selected, getAnchor, idPrefix, dir, theme, label, onSelect, onHover }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const menuSlot = useSlot('slashMenu', 'rte-slash');
  const itemSlot = useSlot('slashItem', 'rte-slash__item');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const anchor = getAnchor?.();
    if (!anchor || !ref.current) return;
    const { offsetHeight: height, offsetWidth: width } = ref.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = dir === 'rtl' ? anchor.right - width : anchor.left;
    left = Math.max(8, Math.min(left, vw - width - 8));
    const below = anchor.bottom + GAP;
    const top = below + height > vh - 8 && anchor.top - GAP - height > 8 ? anchor.top - GAP - height : below;
    setPos({ top, left });
  }, [getAnchor, items, dir]);

  useEffect(() => {
    ref.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!items.length) return null;

  return createPortal(
    <div className="rte-portal" data-theme={theme === 'auto' ? undefined : theme} dir={dir}>
      <div
        ref={ref}
        {...menuSlot}
        role="listbox"
        aria-label={label}
        style={{ width: DEFAULT_MENU_WIDTH, ...menuSlot.style, top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
        // clicking must not blur the editor
        onMouseDown={(e) => e.preventDefault()}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            id={`${idPrefix}-${item.id}`}
            role="option"
            aria-selected={index === selected}
            {...itemSlot}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(item)}
          >
            <span className="rte-slash__icon" aria-hidden="true">
              {item.icon as React.ReactNode}
            </span>
            <span className="rte-slash__text">
              <span className="rte-slash__title">{item.title}</span>
              <span className="rte-slash__desc">{item.description}</span>
            </span>
            <span className="rte-slash__cmd" dir="ltr">
              /{item.id}
            </span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};
