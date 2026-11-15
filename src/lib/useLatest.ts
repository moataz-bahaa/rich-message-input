import { useRef, type MutableRefObject } from 'react';

/** Ref that always holds the value from the latest render, so long-lived callbacks never go stale. */
export const useLatest = <T,>(value: T): MutableRefObject<T> => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};
