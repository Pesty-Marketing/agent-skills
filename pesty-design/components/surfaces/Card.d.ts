import * as React from 'react';

/** Surface container — the base card used across the system. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "default" */
  variant?: 'default' | 'subtle' | 'deep' | 'outline';
  /** Inner padding. @default "lg" */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Lift + deepen shadow on hover. @default false */
  interactive?: boolean;
}
export function Card(props: CardProps): JSX.Element;
