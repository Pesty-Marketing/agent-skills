import React from 'react';

/**
 * Compact status pill for data tables & KPI tiles — 11px uppercase mono.
 * Always pairs color with a text label (and an optional dot); never relies
 * on color alone, so status is legible to color-blind users. Use 2–3 states
 * per table at most (Master UI Design) — more pills just add visual noise.
 */
export function StatusPill({ children, variant = 'neutral', dot = true, className = '', ...rest }) {
  const variants = {
    success: { background: 'var(--success-bg)', color: 'var(--green-600)' },
    warning: { background: 'var(--warning-bg)', color: 'var(--amber-700)' },
    danger:  { background: 'var(--danger-bg)',  color: 'var(--red-700)' },
    info:    { background: 'var(--teal-100)',   color: 'var(--ink-700)' },
    neutral: { background: 'var(--n-100)',      color: 'var(--n-700)' },
  };
  const v = variants[variant] || variants.neutral;
  return (
    <span
      className={`pesty-statuspill ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-medium)',
        fontSize: 'var(--text-2xs)', lineHeight: 1,
        textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
        padding: '4px 9px', borderRadius: 'var(--radius-pill)',
        ...v,
      }}
      {...rest}
    >
      {dot && (
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}
