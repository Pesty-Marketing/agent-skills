import * as React from 'react';

/** Sticky content-region top bar. */
export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Page title. */
  title?: React.ReactNode;
  /** Leading slot (mobile menu button, breadcrumb). */
  left?: React.ReactNode;
  /** Flexible search slot (e.g. an `<Input icon="search" />`). */
  search?: React.ReactNode;
  /** Right-aligned actions (buttons, avatar, bell). */
  actions?: React.ReactNode;
}
export function Topbar(props: TopbarProps): JSX.Element;
