import * as React from 'react';

/** Deep-teal code / snippet panel with optional label and copy button. */
export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Code content. Wrap parts in <span className="c|k|s"> (comment/keyword/string) for syntax colour on the dark panel. */
  children: React.ReactNode;
  /** Optional uppercase mono caption above the panel (e.g. "Example request"). */
  label?: React.ReactNode;
  /** Plain text to copy; when provided, a Copy button appears. Omit for a static panel. */
  copyText?: string;
}
export function CodeBlock(props: CodeBlockProps): JSX.Element;
