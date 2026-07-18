import React from 'react';

/**
 * Dashboard layout frame: a fixed `sidebar` on the left, a sticky `topbar`
 * above a flexing content region (the "implicit grid" — fixed sidebar, main
 * area fills the rest; Master UI Design). Content caps at
 * `--container-dashboard` (1320px) and centers, unless `fullBleed` — use
 * full-bleed for true always-on analytics dashboards.
 */
export function DashboardShell({
  sidebar,
  topbar,
  children,
  fullBleed = false,
  contentMaxWidth = 'var(--container-dashboard)',
  className = '',
  style = {},
  ...rest
}) {
  return (
    <div
      className={`pesty-shell ${className}`}
      style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-subtle)', ...style }}
      {...rest}
    >
      {sidebar}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {topbar}
        <main style={{ flex: 1, padding: 'var(--dash-gutter)' }}>
          <div style={{
            width: '100%',
            maxWidth: fullBleed ? 'none' : contentMaxWidth,
            margin: fullBleed ? 0 : '0 auto',
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
