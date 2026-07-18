import * as React from 'react';
import { IconName } from '../core/Icon';

/** Filter / toggle chip. */
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Selected (toggled-on) state. @default false */
  selected?: boolean;
  /** Show a remove ✕. @default false */
  removable?: boolean;
  /** Fires when the ✕ is clicked. */
  onRemove?: (e: React.MouseEvent) => void;
  /** Optional leading icon. */
  icon?: IconName;
}
export function Chip(props: ChipProps): JSX.Element;
