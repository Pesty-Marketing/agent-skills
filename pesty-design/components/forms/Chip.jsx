import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Filter / toggle chip. `selected` flips it to the Pesty-Red subtle fill;
 * `removable` adds an ✕ that fires `onRemove`. Keyboard-operable (it's a
 * button) with a visible focus ring.
 */
const CSS = `
.pesty-chip {
  appearance: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-body); font-weight: var(--fw-medium); font-size: var(--text-sm);
  color: var(--text-body); background: var(--n-0); border: 1.5px solid var(--border-strong);
  border-radius: var(--radius-pill); padding: 6px 14px; line-height: 1;
  transition: background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
}
.pesty-chip:hover { border-color: var(--n-400); color: var(--text-strong); }
.pesty-chip[aria-pressed="true"] { background: var(--brand-subtle); border-color: var(--brand); color: var(--brand-press); }
.pesty-chip:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.pesty-chip__x { display: inline-flex; margin: 0 -3px 0 1px; opacity: 0.6; }
.pesty-chip__x:hover { opacity: 1; }
`;

if (typeof document !== 'undefined' && !document.getElementById('pesty-chip-css')) {
  const s = document.createElement('style');
  s.id = 'pesty-chip-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Chip({ children, selected = false, removable = false, onRemove, icon, className = '', ...rest }) {
  return (
    <button type="button" className={`pesty-chip ${className}`} aria-pressed={selected} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
      {removable && (
        <span
          className="pesty-chip__x"
          role="button"
          aria-label="Remove"
          onClick={(e) => { e.stopPropagation(); if (onRemove) onRemove(e); }}
        >
          <Icon name="x" size={14} />
        </span>
      )}
    </button>
  );
}
