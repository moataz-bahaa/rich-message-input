import { TextInput, defaultSlashCommands } from 'rich-message-input';
import 'rich-message-input/styles.css';

// A minimal editor: only these toolbar buttons, and no media slash commands.
const textOnlyCommands = defaultSlashCommands.filter((c) => !['attach', 'audio', 'video'].includes(c.id));

export const ToolbarAndCommands = () => (
  <TextInput
    toolbar={['heading', 'bold', 'italic', 'link', 'bulletList', 'orderedList']}
    commands={textOnlyCommands}
    minHeight={96}
  />
);
