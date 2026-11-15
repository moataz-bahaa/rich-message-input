import { useCallback, useMemo, useRef, useState } from 'react';
import type { SlashItem, SlashMenuState, SlashOptions } from '../extensions/slash-command';
import { useLatest } from '../lib/useLatest';

type Options = { getItems: (query: string) => SlashItem[] };

/**
 * Owns the slash menu's React state and keyboard handling.
 * `extensionOptions` is created once so it can be handed to the Tiptap extension at mount.
 */
export const useSlashMenu = ({ getItems }: Options) => {
  const [menu, setMenu] = useState<SlashMenuState | null>(null);
  const [selected, setSelectedState] = useState(0);
  const menuRef = useRef<SlashMenuState | null>(null);
  const selectedRef = useRef(0);
  const getItemsRef = useLatest(getItems);

  const setSelected = useCallback((index: number) => {
    selectedRef.current = index;
    setSelectedState(index);
  }, []);

  const extensionOptions = useMemo<SlashOptions>(() => {
    const updateMenu = (next: SlashMenuState | null) => {
      menuRef.current = next;
      setMenu(next);
    };

    const handleKey = (event: KeyboardEvent): boolean => {
      const current = menuRef.current;
      if (!current) return false;
      const count = current.items.length;

      switch (event.key) {
        case 'ArrowDown':
          setSelected((selectedRef.current + 1) % count);
          return true;
        case 'ArrowUp':
          setSelected((selectedRef.current - 1 + count) % count);
          return true;
        case 'Enter':
        case 'Tab': {
          const item = current.items[selectedRef.current];
          if (item) current.command(item);
          return true;
        }
        case 'Escape':
          updateMenu(null);
          return false; // the suggestion plugin closes itself
        default:
          return false;
      }
    };

    return {
      getItems: (query) => getItemsRef.current(query),
      onState: (state) => {
        updateMenu(state && state.items.length > 0 ? state : null);
        setSelected(0);
      },
      onKeyDown: handleKey,
    };
  }, [getItemsRef, setSelected]);

  return { menu, selected, setSelected, extensionOptions };
};
