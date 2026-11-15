import { useRecorder, type RecorderErrorReason, type RecorderResult } from '../media/useRecorder';
import type { Messages, RecordingKind } from '../types';

type Options = {
  messages: Messages['recording'];
  onRecordingComplete?: (blob: Blob, info: { kind: RecordingKind; duration: number; mimeType: string }) => void;
  addRecording: (result: RecorderResult) => Promise<void>;
  reportError: (error: Error) => void;
};

const describeRecordingError = (messages: Messages['recording'], error: Error, reason: RecorderErrorReason): string => {
  if (reason === 'unsupported') return messages.unsupported;
  if (reason === 'failed') return messages.failed;
  return `${messages.denied} (${error.message})`;
};

/** Recorder wired to the consumer callbacks, the attachment pipeline and localized errors. */
export const useMediaRecording = ({ messages, onRecordingComplete, addRecording, reportError }: Options) =>
  useRecorder({
    onComplete: (result) => {
      const { blob, kind, duration, mimeType } = result;
      onRecordingComplete?.(blob, { kind, duration, mimeType });
      void addRecording(result);
    },
    onError: (error, reason) => reportError(new Error(describeRecordingError(messages, error, reason))),
  });
