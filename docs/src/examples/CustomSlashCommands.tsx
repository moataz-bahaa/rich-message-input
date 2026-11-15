import { TextInput, type SlashCommand } from 'rich-message-input';
import 'rich-message-input/styles.css';

// Type "/" then "date" or "shrug". Commands can use any Tiptap editor command.
const extraCommands: SlashCommand[] = [
  {
    id: 'date',
    title: 'Today',
    description: 'Insert the current date',
    icon: '📅',
    keywords: ['time', 'calendar'],
    run: ({ editor }) => editor.chain().focus().insertContent(new Date().toLocaleDateString() + ' ').run(),
  },
  {
    id: 'shrug',
    title: 'Shrug',
    description: 'Insert ¯\\_(ツ)_/¯',
    icon: '🤷',
    run: ({ editor }) => editor.chain().focus().insertContent('¯\\_(ツ)_/¯ ').run(),
  },
];

export const CustomSlashCommands = () => <TextInput extraCommands={extraCommands} />;
