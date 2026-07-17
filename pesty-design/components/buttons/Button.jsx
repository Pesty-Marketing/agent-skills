import React from 'react';
import { Icon } from '../core/Icon.jsx';

const CSS = `
.pesty-btn {
  --_bg: var(--brand); --_fg: var(--text-on-brand); --_bd: transparent;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5em;
  font-family: var(--font-display); font-weight: var(--fw-semibold);
  border: 1.5px solid var(--_bd); background: var(--_bg); color: var(--_fg);
  border-radius: var(--radius-pill); cursor: pointer; text-decoration: none;
  white-space: nowrap; line-height: 1; letter-spacing: -0.01em;
  transition: background var(--dur-base) var(--ease-standard),
              color var(--dur-base) var(--ease-standard),
              border-color var(--dur-base) var(--ease-standard),
              box-shadow var(--dur-base) var(--ease-standard),
              transform var(--dur-fast) var(--ease-standard);
}
.pesty-btn:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.pesty-btn:active { transform: translateY(1px); }
.pesty-btn[disabled] { opacity: 0.45; cursor: not-allowed; transform: none; }

/* sizes */
.pesty-btn--sm { font-size: var(--text-sm); padding: 8px 16px; }
.pesty-btn--md { font-size: var(--text-base); padding: 12px 22px; }
.pesty-btn--lg { font-size: var(--text-md); padding: 16px 30px; }
.pesty-btn--full { width: 100%; }

/* variants */
.pesty-btn--primary { --_bg: var(--brand); --_fg: #fff; }
.pesty-btn--primary:hover:not([disabled]) { --_bg: var(--brand-hover); box-shadow: var(--shadow-brand); }
.pesty-btn--secondary { --_bg: var(--ink-900); --_fg: #fff; }
.pesty-btn--secondary:hover:not([disabled]) { --_bg: var(--ink-800); box-shadow: var(--shadow-md); }
.pesty-btn--outline { --_bg: transparent; --_fg: var(--ink-900); --_bd: var(--border-strong); }
.pesty-btn--outline:hover:not([disabled]) { --_bd: var(--ink-900); --_bg: var(--n-50); }
.pesty-btn--ghost { --_bg: transparent; --_fg: var(--brand); --_bd: transparent; }
.pesty-btn--ghost:hover:not([disabled]) { --_bg: var(--brand-subtle); }
.pesty-btn--light { --_bg: #fff; --_fg: var(--ink-900); }
.pesty-btn--light:hover:not([disabled]) { --_bg: var(--n-100); }
`;

if (typeof document !== 'undefined' && !document.getElementById('pesty-btn-css')) {
  const s = document.createElement('style');
  s.id = 'pesty-btn-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/**
 * Primary action button. Pill-shaped, Epilogue, with optional leading/trailing icons.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  full = false,
  as = 'button',
  className = '',
  ...rest
}) {
  const Tag = as;
  const cls = [
    'pesty-btn',
    `pesty-btn--${variant}`,
    `pesty-btn--${size}`,
    full ? 'pesty-btn--full' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 16 : 18;

  return (
    <Tag className={cls} {...rest}>
      {iconLeft && <Icon name={iconLeft} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </Tag>
  );
}
