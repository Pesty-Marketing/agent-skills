import * as React from 'react';

/** Dashboard layout frame — fixed sidebar + sticky topbar + flexing content. */
export interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The `<Sidebar>` element. */
  sidebar?: React.ReactNode;
  /** The `<Topbar>` element. */
  topbar?: React.ReactNode;
  /** Remove the content max-width cap for full-bleed analytics dashboards. @default false */
  fullBleed?: boolean;
  /** Content max-width when not full-bleed. @default "var(--container-dashboard)" (1320px) */
  contentMaxWidth?: string;
}
export function DashboardShell(props: DashboardShellProps): JSX.Element;
