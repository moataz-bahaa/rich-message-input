import { useCallback } from 'react';
import { toError } from '../lib/errors';
import { useLatest } from '../lib/useLatest';

/** Stable error callback: forwards to `onError`, falling back to the console. */
export const useErrorReporter = (onError?: (error: Error) => void) => {
  const handler = useLatest(onError);
  return useCallback(
    (error: unknown) => {
      const normalized = toError(error);
      if (handler.current) handler.current(normalized);
      else console.error(normalized);
    },
    [handler],
  );
};
