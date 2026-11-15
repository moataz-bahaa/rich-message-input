import { useSlot } from '../slots';
import { Icon } from './Icons';

type Props = {
  statusText: string;
  /** Omit to hide the send button. */
  onSend?: () => void;
  sendDisabled: boolean;
  sendLabel: string;
};

export const Footer = ({ statusText, onSend, sendDisabled, sendLabel }: Props) => {
  const footer = useSlot('footer', 'rte-footer');
  const status = useSlot('status', 'rte-status');
  const sendButton = useSlot('sendButton', 'rte-send');

  return (
    <div {...footer}>
      <span {...status} aria-live="polite">
        {statusText}
      </span>
      {onSend && (
        <button type="button" {...sendButton} disabled={sendDisabled} aria-label={sendLabel} title={sendLabel} onClick={onSend}>
          <Icon name="send" />
        </button>
      )}
    </div>
  );
};
