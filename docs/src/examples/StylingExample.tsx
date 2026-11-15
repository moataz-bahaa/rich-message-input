import { TextInput } from 'rich-message-input';
import 'rich-message-input/styles.css';

export const StylingExample = () => (
  <TextInput
    onSubmit={() => {}}
    // 1. Design tokens: CSS variables on the root
    style={{ ['--rte-accent' as string]: '#7c3aed', ['--rte-border-focus' as string]: '#7c3aed', borderRadius: 18 }}
    // 2. Per-part classes (your CSS, Tailwind, CSS modules...)
    classNames={{ sendButton: 'my-pill-send', toolbar: 'my-toolbar' }}
    // 3. Per-part inline styles
    styles={{ editor: { fontSize: 17, fontFamily: 'Georgia, serif' }, footer: { paddingBlock: 6 } }}
    placeholder="Styled through props…"
  />
);

/* In your stylesheet (un-layered CSS always beats the library's @layer rte):

   .my-pill-send { width: 52px; border-radius: 999px; }
   .my-toolbar   { background: rgba(124, 58, 237, .08); }
   [data-rte-slot='toolbarButton'][data-active] { background: hotpink; }
*/
