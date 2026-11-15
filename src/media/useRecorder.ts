import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecordingKind } from '../types';

export type RecorderResult = { blob: Blob; kind: RecordingKind; duration: number; mimeType: string };

export type RecorderState =
  | { status: 'idle' }
  | { status: 'recording'; kind: RecordingKind; stream: MediaStream; elapsed: number };

const pickMimeType = (kind: RecordingKind): string | undefined => {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates =
    kind === 'audio'
      ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
      : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
};

export const isRecordingSupported = (): boolean =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

export type RecorderErrorReason = 'unsupported' | 'denied' | 'failed';

type Options = {
  onComplete: (result: RecorderResult) => void;
  onError: (error: Error, reason: RecorderErrorReason) => void;
};

/** MediaRecorder wrapper that owns the stream lifecycle. */
export const useRecorder = ({ onComplete, onError }: Options) => {
  const [state, setState] = useState<RecorderState>({ status: 'idle' });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const cancelledRef = useRef(false);
  const startingRef = useRef(false);
  const unmountedRef = useRef(false);
  const callbacks = useRef({ onComplete, onError });
  callbacks.current = { onComplete, onError };

  const cleanup = useCallback(() => {
    if (timerRef.current != null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setState({ status: 'idle' });
  }, []);

  const start = useCallback(
    async (kind: RecordingKind) => {
      if (recorderRef.current || startingRef.current) return;
      if (!isRecordingSupported()) {
        callbacks.current.onError(new Error('Recording is not supported'), 'unsupported');
        return;
      }
      startingRef.current = true;
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(kind === 'audio' ? { audio: true } : { audio: true, video: true });
      } catch (error) {
        startingRef.current = false;
        callbacks.current.onError(error instanceof Error ? error : new Error(String(error)), 'denied');
        return;
      }
      if (unmountedRef.current) {
        startingRef.current = false;
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const mimeType = pickMimeType(kind);
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      } catch (error) {
        startingRef.current = false;
        stream.getTracks().forEach((t) => t.stop());
        callbacks.current.onError(error instanceof Error ? error : new Error(String(error)), 'unsupported');
        return;
      }
      const chunks: Blob[] = [];
      cancelledRef.current = false;
      streamRef.current = stream;
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = () => {
        const duration = (Date.now() - startedAtRef.current) / 1000;
        const type = recorder.mimeType || mimeType || (kind === 'audio' ? 'audio/webm' : 'video/webm');
        const cancelled = cancelledRef.current;
        cleanup();
        if (!cancelled && chunks.length) callbacks.current.onComplete({ blob: new Blob(chunks, { type }), kind, duration, mimeType: type });
      };

      // A failing device or encoder must not leave the UI stuck in "recording".
      recorder.onerror = () => {
        cancelledRef.current = true;
        if (recorder.state === 'recording') recorder.stop();
        else cleanup();
        callbacks.current.onError(new Error('MediaRecorder error'), 'failed');
      };
      // Unplugged device: keep what was recorded so far.
      stream.getTracks().forEach((track) =>
        track.addEventListener('ended', () => recorder.state === 'recording' && recorder.stop()),
      );

      startingRef.current = false;
      recorder.start(250);
      setState({ status: 'recording', kind, stream, elapsed: 0 });
      timerRef.current = window.setInterval(() => {
        setState((s) => (s.status === 'recording' ? { ...s, elapsed: (Date.now() - startedAtRef.current) / 1000 } : s));
      }, 250);
    },
    [cleanup],
  );

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    else cleanup();
  }, [cleanup]);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      cancelledRef.current = true;
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    };
  }, []);

  return { state, start, stop, cancel };
};
