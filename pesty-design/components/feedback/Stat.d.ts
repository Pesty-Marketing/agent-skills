import * as React from 'react';
import { IconName } from '../core/Icon';

/** Big result metric — the hero numbers Pesty leads with. */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The headline figure, e.g. "$100,000". */
  value: React.ReactNode;
  /** Supporting caption. */
  label: React.ReactNode;
  /** Optional icon badge above the figure. */
  icon?: IconName;
  /** Render the figure in Pesty Red. @default true */
  accent?: boolean;
  /** @default "left" */
  align?: 'left' | 'center';
  /** Style for dark backgrounds. @default false */
  onDark?: boolean;
}
export function Stat(props: StatProps): JSX.Element;
