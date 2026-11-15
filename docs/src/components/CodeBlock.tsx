import { useState } from 'react';

type Props = { code: string; label?: string };

export const CodeBlock = ({ code, label }: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access can be blocked; the text stays selectable
    }
  };

  return (
    <figure className="code">
      <figcaption>
        <span>{label}</span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </figure>
  );
};
