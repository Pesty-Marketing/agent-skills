import * as React from 'react';
import { IconName } from '../core/Icon';

export interface SidebarChild {
  id: string;
  label: React.ReactNode;
}

export interface SidebarItem {
  /** Nav item id (matched against `activeId`, reported by `onSelect`). */
  id?: string;
  label?: React.ReactNode;
  icon?: IconName;
  count?: number;
  /** One level of nested children (don't nest deeper). */
  children?: SidebarChild[];
  /** Render a section-divider label instead of a nav item. */
  groupLabel?: string;
}

/** Fixed-width deep-teal sidebar navigation. */
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  /** Header slot (logo / brand). */
  header?: React.ReactNode;
  /** Footer slot (user, sign-out). */
  footer?: React.ReactNode;
  /** Currently active item id. */
  activeId?: string;
  /** Fires with the selected item id. */
  onSelect?: (id: string) => void;
}
export function Sidebar(props: SidebarProps): JSX.Element;
