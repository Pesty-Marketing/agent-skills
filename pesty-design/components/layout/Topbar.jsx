import React from 'react';

/**
 * Sticky top bar for the content region. Optional leading slot (mobile menu /
 * breadcrumb), page title, a flexible search slot, and right-aligned actions.
 * White surface, hairline bottom border — sits above deep-teal sidebar + off-
 * white content.
 */
export function Topbar({ title, left, search, actions, className = '', style = {}, ...rest }) {
  return (
    <header
      className={`pesty-topbar ${className}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        height: 'var(--topbar-h)', padding: '0 var(--dash-gutter)',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 10, boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    >
      {left}
      {title && (
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--text-md)', color: 'var(--text-strong)', whiteSpace: 'nowrap',
        }}>
          {title}
        </div>
      )}
      {search && <div style={{ flex: 1, maxWidth: 380 }}>{search}</div>}
      {actions && (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {actions}
        </div>
      )}
    </header>
  );
}
