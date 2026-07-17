import * as React from 'react';
import { IconName } from '../core/Icon';

/** Icon-only button for nav toggles, close actions, and compact controls. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon name to render. */
  icon: IconName;
  /** @default "outline" */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'light';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Fully rounded (circular). @default false */
  round?: boolean;
  /** Accessible label (sets aria-label). */
  label?: string;
}

export function IconButton(props: IconButtonProps): JSX.Element;
