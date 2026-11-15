import type { ReactElement } from 'react';
import type { ToolbarItemId } from '../types';

const paths: Record<ToolbarItemId | 'send' | 'stop' | 'close', ReactElement> = {
  heading: <path d="M5 4v16M19 4v16M5 12h14" />,
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M10 5h8M6 19h8M14 5l-4 14" />,
  underline: <path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />,
  strike: <path d="M4 12h16M16 6.5C15.5 5 14 4 12 4c-2.5 0-4 1.3-4 3 0 1.4 1 2.3 4 3M8 17.5C8.7 19 10.2 20 12.2 20c2.5 0 4-1.3 4-3 0-.8-.3-1.500-1-2" />,
  code: <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />,
  highlight: <path d="M4 20h7M14 4l6 6-8 8-6-6zM6 12l-2 8 8-2" />,
  link: <path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />,
  bulletList: <path d="M9 6h11M9 12h11M9 18h11M4.500 6h.01M4.500 12h.01M4.500 18h.01" />,
  orderedList: <path d="M10 6h10M10 12h10M10 18h10M4 5l1-1v4M4 14h2l-2 3h2" />,
  codeBlock: <path d="M4 5h16v14H4zM9 10l-2 2 2 2M15 10l2 2-2 2" />,
  divider: <path d="M4 12h16M8 7h.01M12 7h.01M16 7h.01M8 17h.01M12 17h.01M16 17h.01" />,
  attach: <path d="M20 11l-8.500 8.500a5 5 0 0 1-7-7L13 4a3.500 3.500 0 0 1 5 5l-8.500 8.500a2 2 0 0 1-3-3L14 7" />,
  audio: <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />,
  video: <path d="M3 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3zM16 11l5-3v8l-5-3" />,
  direction: <path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4" />,
  send: <path d="M4 12l16-8-6 16-3-7z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

export const Icon = ({ name }: { name: keyof typeof paths }) => (
  <svg
    className="rte-icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {paths[name]}
  </svg>
);
