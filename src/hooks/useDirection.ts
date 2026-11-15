import { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { syncDirection } from '../extensions/direction';
import { resolveDirection } from '../i18n';
import { useLatest } from '../lib/useLatest';
import type { Direction, DirectionSetting, LocaleCode } from '../types';

type Options = {
  direction?: DirectionSetting;
  defaultDirection?: DirectionSetting;
  locale: LocaleCode;
  onChange?: (direction: DirectionSetting) => void;
};

/** Controlled-or-uncontrolled direction state plus the resolved direction of the UI chrome. */
export const useDirection = ({ direction, defaultDirection = 'auto', locale, onChange }: Options) => {
  const [internal, setInternal] = useState<DirectionSetting>(defaultDirection);
  const current = direction ?? internal;
  const chromeDirection: Direction = resolveDirection(current, locale);
  const latest = useLatest({ chromeDirection, onChange });

  const toggle = useCallback(() => {
    const next: Direction = latest.current.chromeDirection === 'rtl' ? 'ltr' : 'rtl';
    setInternal(next);
    latest.current.onChange?.(next);
  }, [latest]);

  return { direction: current, chromeDirection, toggle };
};

/** Pushes the current direction into the editor's decoration plugin. */
export const useDirectionSync = (editor: Editor | null, direction: DirectionSetting, fallback: Direction) => {
  useEffect(() => {
    if (editor) syncDirection(editor, direction, fallback);
  }, [editor, direction, fallback]);
};
