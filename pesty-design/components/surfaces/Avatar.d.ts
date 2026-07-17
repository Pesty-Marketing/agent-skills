import * as React from 'react';

/** Circular avatar for team members & author bylines. Falls back to initials. */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. */
  src?: string;
  alt?: string;
  /** Name — used for initials fallback. */
  name?: string;
  /** Diameter in px. @default 56 */
  size?: number;
  /** Red brand ring around the avatar. @default false */
  ring?: boolean;
}
export function Avatar(props: AvatarProps): JSX.Element;
