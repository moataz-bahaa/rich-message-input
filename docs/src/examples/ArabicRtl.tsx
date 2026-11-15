import { useState } from 'react';
import { Preview, TextInput, type DirectionSetting, type RichTextDocument } from 'rich-message-input';
import 'rich-message-input/styles.css';

const initial: RichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'مرحباً! The ' },
        { type: 'text', text: 'editor', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' يدعم العربية and English together.' },
      ],
    },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'عنصر في القائمة' }] }] }] },
  ],
};

export const ArabicRtl = () => {
  const [direction, setDirection] = useState<DirectionSetting>('auto');
  const [doc, setDoc] = useState(initial);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* locale="ar" translates the UI and makes the toolbar/menus RTL.
          direction="auto" lets each paragraph pick its own direction. */}
      <TextInput locale="ar" direction={direction} onDirectionChange={setDirection} value={doc} onChange={setDoc} />
      <small>direction = {direction} (use the ⇄ toolbar button to switch)</small>
      <Preview value={doc} locale="ar" direction={direction} />
    </div>
  );
};
