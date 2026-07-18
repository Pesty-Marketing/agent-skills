import * as React from 'react';

export interface SpecItem {
  /** Label — rendered as a mono uppercase key. */
  key: React.ReactNode;
  /** Value — accepts JSX (links, <code>, pills). */
  value: React.ReactNode;
}

/** Responsive key→value definition list for spec / metadata blocks. */
export interface SpecListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Key→value rows. */
  items: SpecItem[];
  /** Min column width before wrapping (px number or CSS length). Default 260. */
  min?: number | string;
}
export function SpecList(props: SpecListProps): JSX.Element;
