import { useRef, useState } from 'react';
import { TextInput, type TextInputHandle } from 'rich-message-input';
import 'rich-message-input/styles.css';

export const RefApi = () => {
  const input = useRef<TextInputHandle>(null);
  const [output, setOutput] = useState('');

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <TextInput ref={input} hideSendButton />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => input.current?.focus()}>Focus</button>
        <button onClick={() => setOutput(JSON.stringify(input.current?.getDocument(), null, 2))}>getDocument()</button>
        <button onClick={() => setOutput(String(input.current?.isEmpty()))}>isEmpty()</button>
        <button onClick={() => input.current?.clear()}>Clear</button>
      </div>
      {output && <pre style={{ maxHeight: 160, overflow: 'auto', margin: 0 }}>{output}</pre>}
    </div>
  );
};
