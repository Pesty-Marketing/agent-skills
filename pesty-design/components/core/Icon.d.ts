import * as React from 'react';

export type IconName =
  | 'arrow-right' | 'arrow-up-right' | 'check' | 'phone' | 'search'
  | 'menu' | 'x' | 'star' | 'chevron-right' | 'chevron-down'
  | 'map-pin' | 'trending-up' | 'shield-check' | 'target' | 'zap';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon to render, from the curated Lucide-based set. */
  name: IconName;
  /** Pixel size (width & height). @default 20 */
  size?: number;
  /** Stroke width for outline icons. @default 2 */
  strokeWidth?: number;
}

/** Inline SVG icon from the Pesty icon set (Lucide-based, 24px grid, inherits currentColor). */
export function Icon(props: IconProps): JSX.Element;
