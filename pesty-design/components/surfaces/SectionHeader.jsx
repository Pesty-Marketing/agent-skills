import React from 'react';

/**
 * Section header with the signature red left-border — organizes dense views
 * into scannable blocks. Title + optional subtitle on the left, an optional
 * actions slot (buttons, chips, tabs) on the right.
 */
export function SectionHeader({ title, subtitle, actions, className = '', style = {}, ...rest }) {
  return (
    <div
      className={`pesty-sectionhead ${className}`}
      style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 'var(--space-4)', borderLeft: '3px solid var(--brand)',
        paddingLeft: 'var(--space-4)', margin: '0 0 var(--space-5)',
        ...style,
      }}
      {...rest}
    >
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-bold)',
          fontSize: 'var(--text-lg)', lineHeight: 1.2, letterSpacing: '-0.01em',
          color: 'var(--text-strong)', margin: 0,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
