import React from 'react';
import { Icon } from '../core/Icon.jsx';

/** Square/circular icon-only button — nav toggles, close, compact actions. */
export function IconButton({
  icon,
  variant = 'outline',
  size = 'md',
  round = false,
  label,
  className = '',
  ...rest
}) {
  const dim = size === 'lg' ? 52 : size === 'sm' ? 36 : 44;
  const iconSize = size === 'lg' ? 24 : size === 'sm' ? 18 : 20;

  const variants = {
    primary: { background: 'var(--brand)', color: '#fff', border: '1.5px solid transparent' },
    secondary: { background: 'var(--ink-900)', color: '#fff', border: '1.5px solid transparent' },
    outline: { background: 'transparent', color: 'var(--ink-900)', border: '1.5px solid var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--ink-700)', border: '1.5px solid transparent' },
    light: { background: '#fff', color: 'var(--ink-900)', border: '1.5px solid transparent' },
  };

  return (
    <button
      aria-label={label}
      className={`pesty-iconbtn ${className}`}
      style={{
        width: dim, height: dim,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: round ? 'var(--radius-pill)' : 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'background var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
        ...variants[variant],
      }}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
