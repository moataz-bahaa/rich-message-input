import { useEffect, useRef, useState } from 'react';
import { useSlot } from '../slots';
import type { Messages } from '../types';

type Props = {
  initialUrl: string;
  hasLink: boolean;
  messages: Messages['link'];
  onApply: (url: string) => void;
  onRemove: () => void;
  onCancel: () => void;
};

export const LinkEditor = ({ initialUrl, hasLink, messages, onApply, onRemove, onCancel }: Props) => {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const slot = useSlot('linkEditor', 'rte-link');

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <form
      {...slot}
      onSubmit={(e) => {
        e.preventDefault();
        onApply(url);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <label className="rte-link__label">
        <span>{messages.urlLabel}</span>
        <input
          ref={inputRef}
          className="rte-link__input"
          type="text"
          dir="ltr"
          inputMode="url"
          value={url}
          placeholder={messages.urlPlaceholder}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <button type="submit" className="rte-link__btn rte-link__btn--primary">
        {messages.apply}
      </button>
      {hasLink && (
        <button type="button" className="rte-link__btn" onClick={onRemove}>
          {messages.remove}
        </button>
      )}
      <button type="button" className="rte-link__btn" onClick={onCancel}>
        {messages.cancel}
      </button>
    </form>
  );
};
