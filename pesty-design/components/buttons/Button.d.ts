import * as React from 'react';
import { IconName } from '../core/Icon';

/** Primary action button — pill-shaped, Poppins, with optional icons. */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'light';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon name. */
  iconLeft?: IconName;
  /** Trailing icon name. */
  iconRight?: IconName;
  /** Stretch to fill container width. @default false */
  full?: boolean;
  /** Render as a different element, e.g. "a" for links. @default "button" */
  as?: 'button' | 'a';
}

export function Button(props: ButtonProps): JSX.Element;
