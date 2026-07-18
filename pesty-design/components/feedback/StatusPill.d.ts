import * as React from 'react';

/** Compact status pill for tables & KPI tiles — 11px uppercase, color + label. */
export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic state. @default "neutral" */
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Show the leading status dot. @default true */
  dot?: boolean;
}
export function StatusPill(props: StatusPillProps): JSX.Element;
