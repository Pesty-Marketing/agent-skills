import React from 'react';
import { Icon } from '../core/Icon.jsx';

const CSS = `
.pesty-field { display: flex; flex-direction: column; gap: 7px; }
.pesty-field__label { font-family: var(--font-display); font-weight: var(--fw-semibold); font-size: var(--text-sm); color: var(--text-strong); }
.pesty-field__hint { font-size: var(--text-xs); color: var(--text-muted); }
.pesty-field__hint--error { color: var(--danger); }
.pesty-inputwrap { position: relative; display: flex; align-items: center; }
.pesty-inputwrap > svg { position: absolute; left: 14px; color: var(--text-faint); pointer-events: none; }
.pesty-input {
  width: 100%; font-family: var(--font-body); font-size: var(--text-base);
  color: var(--text-strong); background: var(--n-0);
  border: 1.5px solid var(--border-strong); border-radius: var(--radius-md);
  padding: 12px 14px; line-height: 1.4;
  transition: border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard);
}
.pesty-input::placeholder { color: var(--text-faint); }
.pesty-input.has-icon { padding-left: 42px; }
.pesty-input:hover:not(:disabled) { border-color: var(--n-400); }
.pesty-input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px var(--focus-ring); }
.pesty-input:disabled { background: var(--n-50); color: var(--text-muted); cursor: not-allowed; }
.pesty-input--error { border-color: var(--danger); }
.pesty-input--error:focus { box-shadow: 0 0 0 3px var(--focus-ring); }
textarea.pesty-input { resize: vertical; min-height: 96px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('pesty-field-css')) {
  const s = document.createElement('style');
  s.id = 'pesty-field-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Text input with optional label, leading icon, hint and error state. */
export function Input({ label, hint, error, icon, id, className = '', ...rest }) {
  const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className="pesty-field">
      {label && <label className="pesty-field__label" htmlFor={fieldId}>{label}</label>}
      <div className="pesty-inputwrap">
        {icon && <Icon name={icon} size={18} />}
        <input
          id={fieldId}
          className={`pesty-input ${icon ? 'has-icon' : ''} ${error ? 'pesty-input--error' : ''} ${className}`}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span className={`pesty-field__hint ${error ? 'pesty-field__hint--error' : ''}`}>{error || hint}</span>
      )}
    </div>
  );
}
