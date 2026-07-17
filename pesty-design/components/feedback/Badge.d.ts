import * as React from 'react';

/** Small pill label for status, eyebrows, and metadata. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "soft" */
  variant?: 'solid' | 'soft' | 'neutral' | 'outline' | 'dark' | 'success';
  /** @default "md" */
  size?: 'sm' | 'md';
}
export function Badge(props: BadgeProps): JSX.Element;
