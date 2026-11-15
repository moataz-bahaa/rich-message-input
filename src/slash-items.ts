import type { Range } from '@tiptap/core';
import type { SlashItem } from './extensions/slash-command';
import type { Messages, SlashCommand } from './types';

type RunCommand = (command: SlashCommand, range: Range) => void;

/** Resolve commands to menu items, preferring the command's own text over the localized text. */
export const createSlashItems = (
  commands: SlashCommand[],
  localized: Messages['commands'],
  runCommand: RunCommand,
): SlashItem[] =>
  commands.map((command) => {
    const text = localized[command.id];
    return {
      id: command.id,
      title: command.title ?? text?.title ?? command.id,
      description: command.description ?? text?.description ?? '',
      keywords: [...(text?.keywords ?? []), ...(command.keywords ?? [])],
      icon: command.icon,
      run: (range) => runCommand(command, range),
    };
  });

/** Lower is a better match; null means no match. */
const matchRank = (item: SlashItem, query: string): number | null => {
  const id = item.id.toLowerCase();
  const title = item.title.toLowerCase();
  if (id.startsWith(query) || title.startsWith(query)) return 0;
  if (id.includes(query) || title.includes(query)) return 1;
  if (item.keywords.some((keyword) => keyword.toLowerCase().includes(query))) return 2;
  return null;
};

export const filterSlashItems = (items: SlashItem[], rawQuery: string): SlashItem[] => {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return items;
  return items
    .flatMap((item) => {
      const rank = matchRank(item, query);
      return rank === null ? [] : [{ item, rank }];
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item);
};
