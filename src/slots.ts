import { createContext, useContext, type CSSProperties } from 'react';

/** Named parts of <TextInput /> that can be styled from the outside. */
export type TextInputSlot =
  | 'root'
  | 'toolbar'
  | 'toolbarButton'
  | 'toolbarSelect'
  | 'linkEditor'
  | 'scroll'
  | 'editor'
  | 'recorder'
  | 'footer'
  | 'status'
  | 'sendButton'
  | 'slashMenu'
  | 'slashItem';

/** Named parts of <Preview /> that can be styled from the outside. */
export type PreviewSlot = 'root' | 'content' | 'attachment';

export type SlotClassNames<Slot extends string> = Partial<Record<Slot, string>>;
export type SlotStyles<Slot extends string> = Partial<Record<Slot, CSSProperties>>;

export type SlotConfig<Slot extends string> = {
  classNames?: SlotClassNames<Slot>;
  styles?: SlotStyles<Slot>;
};

/** Props to spread onto the element that renders a slot. */
export type SlotProps = {
  className?: string;
  style?: CSSProperties;
  'data-rte-slot': string;
};

export const cx = (...names: Array<string | undefined | false>): string | undefined => names.filter(Boolean).join(' ') || undefined;

/** Base class + consumer class, consumer style, and a stable `data-rte-slot` hook for plain CSS. */
export const slotProps = <Slot extends string>(config: SlotConfig<Slot> | undefined, slot: Slot, baseClass?: string): SlotProps => ({
  className: cx(baseClass, config?.classNames?.[slot]),
  style: config?.styles?.[slot],
  'data-rte-slot': slot,
});

const SlotsContext = createContext<SlotConfig<TextInputSlot> | undefined>(undefined);

export const SlotsProvider = SlotsContext.Provider;

/** Slot props for a <TextInput /> part. Works inside portals, since context follows the React tree. */
export const useSlot = (slot: TextInputSlot, baseClass?: string): SlotProps => slotProps(useContext(SlotsContext), slot, baseClass);

/* ------------------------------------------------------------ CSS object */

const UNITLESS = new Set([
  'aspectRatio',
  'columnCount',
  'flex',
  'flexGrow',
  'flexShrink',
  'fontWeight',
  'lineHeight',
  'opacity',
  'order',
  'tabSize',
  'zIndex',
  'zoom',
]);

const toKebabCase = (property: string): string =>
  property.startsWith('--') ? property : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/^ms-/, '-ms-');

const toCssValue = (property: string, value: string | number): string =>
  typeof value === 'number' && value !== 0 && !UNITLESS.has(property) && !property.startsWith('--') ? `${value}px` : String(value);

/** Serializes a style object for DOM attributes that Tiptap sets as plain strings. */
export const toCssText = (style: CSSProperties | undefined): string | undefined => {
  if (!style) return undefined;
  const declarations = Object.entries(style)
    .filter((entry): entry is [string, string | number] => typeof entry[1] === 'string' || typeof entry[1] === 'number')
    .map(([property, value]) => `${toKebabCase(property)}:${toCssValue(property, value)}`);
  return declarations.length > 0 ? declarations.join(';') : undefined;
};
