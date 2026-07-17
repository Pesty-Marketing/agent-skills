import React from 'react';
import { Icon } from '../core/Icon.jsx';

const CSS = `
.pesty-check { display: inline-flex; align-items: flex-start; gap: 11px; cursor: pointer; font-family: var(--font-body); font-size: var(--text-base); color: var(--text-body); }
.pesty-check input { position: absolute; opacity: 0; width: 0; height: 0; }
.pesty-check__box {
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 6px;
  border: 1.5px solid var(--border-strong); background: var(--n-0);
  display: inline-flex; align-items: center; justify-content: center; margin-top: 1px;
  color: #fff; transition: all var(--dur-base) var(--ease-standard);
}
.pesty-check__box > svg { opacity: 0; transform: scale(0.6); transition: all var(--dur-fast) var(--ease-standard); }
.pesty-check input:checked + .pesty-check__box { background: var(--brand); border-color: var(--brand); }
.pesty-check input:checked + .pesty-check__box > svg { opacity: 1; transform: scale(1); }
.pesty-check input:focus-visible + .pesty-check__box { box-shadow: 0 0 0 3px var(--focus-ring); }
.pesty-check:hover input:not(:checked) + .pesty-check__box { border-color: var(--n-400); }
`;

if (typeof document !== 'undefined' && !document.getElementById('pesty-check-css')) {
  const s = document.createElement('style');
  s.id = 'pesty-check-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

/** Checkbox with the Pesty red fill + check icon. */
export function Checkbox({ label, className = '', ...rest }) {
  return (
    <label className={`pesty-check ${className}`}>
      <input type="checkbox" {...rest} />
      <span className="pesty-check__box"><Icon name="check" size={15} strokeWidth={3} /></span>
      {label && <span>{label}</span>}
    </label>
  );
}
