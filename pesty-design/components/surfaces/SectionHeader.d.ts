import * as React from 'react';

/** Section header with a red left-border, title + optional subtitle + actions. */
export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title. */
  title: React.ReactNode;
  /** Optional supporting line under the title. */
  subtitle?: React.ReactNode;
  /** Optional right-aligned actions (buttons, chips, tabs). */
  actions?: React.ReactNode;
}
export function SectionHeader(props: SectionHeaderProps): JSX.Element;
