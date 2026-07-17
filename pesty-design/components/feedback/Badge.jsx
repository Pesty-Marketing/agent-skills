import React from 'react';

/** Small pill label for status, eyebrows, and metadata. */
export function Badge({ children, variant = 'soft', size = 'md', className = '', ...rest }) {
  const variants = {
    solid:   { background: 'var(--brand)', color: '#fff', border: '1px solid transparent' },
    soft:    { background: 'var(--brand-subtle)', color: 'var(--brand-press)', border: '1px solid transparent' },
    neutral: { background: 'var(--n-100)', color: 'var(--n-700)', border: '1px solid transparent' },
    outline: { background: 'transparent', color: 'var(--ink-900)', border: '1px solid var(--border-strong)' },
    dark:    { background: 'var(--ink-900)', color: '#fff', border: '1px solid transparent' },
    success: { background: 'var(--success-bg)', color: 'var(--green-600)', border: '1px solid transparent' },
  };
  const sizes = {
    sm: { fontSize: '11px', padding: '3px 9px' },
    md: { fontSize: 'var(--text-sm)', padding: '5px 12px' },
  };
  return (
    <span
      className={`pesty-badge ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)',
        lineHeight: 1, borderRadius: 'var(--radius-pill)',
        letterSpacing: '0.01em', whiteSpace: 'nowrap',
        ...sizes[size], ...variants[variant],
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
