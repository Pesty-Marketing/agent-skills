import * as React from 'react';
import { IconName } from '../core/Icon';

export interface TabItem {
  /** Unique id, reported by `onChange` and matched by `value`. */
  id: string;
  /** Tab label. */
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: IconName;
  /** Optional count badge. */
  count?: number;
}

/** Navigation tabs — controlled or uncontrolled. */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  /** Controlled active tab id. */
  value?: string;
  /** Initial active tab id (uncontrolled). Defaults to the first tab. */
  defaultValue?: string;
  /** Fires with the selected tab id. */
  onChange?: (id: string) => void;
}
export function Tabs(props: TabsProps): JSX.Element;
