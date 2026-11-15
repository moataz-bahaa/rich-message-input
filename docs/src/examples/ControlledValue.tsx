import { useState } from 'react';
import { EMPTY_DOCUMENT, Preview, TextInput, toPlainText, type RichTextDocument } from 'rich-message-input';
import 'rich-message-input/styles.css';

export const ControlledValue = () => {
  const [doc, setDoc] = useState<RichTextDocument>(EMPTY_DOCUMENT);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <TextInput value={doc} onChange={setDoc} onSubmit={() => setDoc(EMPTY_DOCUMENT)} />
      <small>Plain text: “{toPlainText(doc)}”</small>
      <Preview value={doc} />
    </div>
  );
};
