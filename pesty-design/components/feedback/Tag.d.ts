import * as React from 'react';
import { IconName } from '../core/Icon';

/** Bordered checkmark feature pill — trust points & inclusion lists. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Leading icon. @default "check" */
  icon?: IconName;
  /** @default "brand" */
  tone?: 'brand' | 'neutral' | 'onDark';
}
export function Tag(props: TagProps): JSX.Element;
