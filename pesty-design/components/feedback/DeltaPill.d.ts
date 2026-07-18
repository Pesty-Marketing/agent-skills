import * as React from 'react';

/** Trend-delta chip (+/-) with directional arrow + semantic color. */
export interface DeltaPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The delta to show, e.g. `12`, `"+12%"`, `"-1.2pts"`. Numeric values get a sign prefix. */
  value: React.ReactNode;
  /** Force the trend direction; otherwise derived from the sign of a numeric `value`. */
  direction?: 'up' | 'down' | 'flat';
  /** Which direction is "good" (green). Flip to `"down"` for cost metrics (CPL, CAC). @default "up" */
  goodDirection?: 'up' | 'down';
  /** Show the trend arrow. @default true */
  showIcon?: boolean;
}
export function DeltaPill(props: DeltaPillProps): JSX.Element;
