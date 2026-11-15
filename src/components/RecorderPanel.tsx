import { useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { formatDuration } from '../content';
import type { RecorderState } from '../media/useRecorder';
import { useSlot } from '../slots';
import type { Messages } from '../types';

type Props = {
  state: Extract<RecorderState, { status: 'recording' }>;
  messages: Messages['recording'];
  onStop: () => void;
  onCancel: () => void;
};

export const RecorderPanel = ({ state, messages, onStop, onCancel }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const slot = useSlot('recorder', 'rte-recorder');

  useEffect(() => {
    if (state.kind === 'video' && videoRef.current) videoRef.current.srcObject = state.stream;
  }, [state.kind, state.stream]);

  return (
    <div {...slot} role="status" aria-live="polite">
      {state.kind === 'video' && <video ref={videoRef} className="rte-recorder__video" autoPlay muted playsInline />}
      <div className="rte-recorder__bar">
        <span className="rte-recorder__dot" aria-hidden="true" />
        <span className="rte-recorder__label">{messages[state.kind]}</span>
        <span className="rte-recorder__time" dir="ltr">
          {formatDuration(state.elapsed)}
        </span>
        <span className="rte-recorder__spacer" />
        <button type="button" className="rte-link__btn" onClick={onCancel}>
          <Icon name="close" /> {messages.cancel}
        </button>
        <button type="button" className="rte-link__btn rte-link__btn--primary" onClick={onStop}>
          <Icon name="stop" /> {messages.stop}
        </button>
      </div>
    </div>
  );
};
