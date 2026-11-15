import { useState } from 'react';
import { Preview, TextInput, type RichTextDocument } from 'rich-message-input';
import 'rich-message-input/styles.css';

export const BasicChat = () => {
  const [messages, setMessages] = useState<RichTextDocument[]>([]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {messages.map((doc, index) => (
        <Preview key={index} value={doc} />
      ))}

      {/* Uncontrolled: the editor clears itself after onSubmit. */}
      <TextInput onSubmit={(doc) => setMessages((all) => [...all, doc])} />
    </div>
  );
};
