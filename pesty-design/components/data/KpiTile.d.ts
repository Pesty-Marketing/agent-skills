import * as React from 'react';
import { IconName } from '../core/Icon';

/** Compact KPI tile — label + 28px value + optional delta + icon chip. */
export interface KpiTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short uppercase metric label. */
  label: React.ReactNode;
  /** The KPI figure (rendered at 28px, tabular-nums). */
  value: React.ReactNode;
  /** Trend delta: a number/string is wrapped in a `DeltaPill`, or pass your own node. */
  delta?: React.ReactNode;
  /** Which direction is "good" for the auto delta. @default "up" */
  deltaGoodDirection?: 'up' | 'down';
  /** Optional icon chip (top-right). */
  icon?: IconName;
  /** Render the value in Pesty Red instead of ink. @default false */
  accent?: boolean;
}
export function KpiTile(props: KpiTileProps): JSX.Element;
