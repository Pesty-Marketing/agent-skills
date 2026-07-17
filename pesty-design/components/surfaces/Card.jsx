import React from 'react';

/**
 * Surface container. White with soft border + shadow by default;
 * `deep` for dark teal panels, `subtle` for the off-white fill.
 * Lifts slightly on hover when `interactive`.
 */
export function Card({
  children,
  variant = 'default',
  padding = 'lg',
  interactive = false,
  className = '',
  style = {},
  ...rest
}) {
  const variants = {
    default: { background: 'var(--n-0)', border: '1px solid var(--border)', color: 'var(--text-body)' },
    subtle:  { background: 'var(--n-50)', border: '1px solid var(--border)', color: 'var(--text-body)' },
    deep:    { background: 'var(--ink-900)', border: '1px solid var(--border-on-dark)', color: 'var(--text-on-dark-muted)' },
    outline: { background: 'transparent', border: '1.5px solid var(--border-strong)', color: 'var(--text-body)' },
  };
  const pads = { none: 0, sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-8)' };

  return (
    <div
      className={`pesty-card ${interactive ? 'pesty-card--interactive' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: pads[padding],
        boxShadow: variant === 'default' ? 'var(--shadow-md)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={interactive ? (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; } : undefined}
      onMouseLeave={interactive ? (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = variant === 'default' ? 'var(--shadow-md)' : 'none'; } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
