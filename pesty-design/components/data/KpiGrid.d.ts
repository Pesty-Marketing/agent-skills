import * as React from 'react';

/** Responsive auto-fit grid for KPI tiles. */
export interface KpiGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Minimum column width before wrapping. @default 220 */
  min?: number | string;
  /** Gap between tiles. @default "var(--space-4)" (16px) */
  gap?: string;
}
export function KpiGrid(props: KpiGridProps): JSX.Element;
