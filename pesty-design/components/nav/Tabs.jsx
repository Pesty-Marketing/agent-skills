import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Navigation tabs for switching dashboard views. Controlled (`value`/`onChange`)
 * or uncontrolled (`defaultValue`). 24px horizontal padding gives the ~48px
 * label spacing desktop tabs want (Master UI Design); active tab is a red
 * underline. Optional per-tab icon and count badge.
 */
const CSS = `
.pesty-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); overflow-x: auto; }
.pesty-tab {
  appearance: none; background: none; border: none; cursor: pointer;
  font-family: var(--font-display); font-weight: var(--fw-semibold); font-size: var(--text-sm);
  color: var(--text-muted); padding: 12px 24px; display: inline-flex; align-items: center; gap: 8px;
  border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap;
  transition: color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.pesty-tab:hover { color: var(--text-strong); }
.pesty-tab[aria-selected="true"] { color: var(--brand); border-bottom-color: var(--brand); }
.pesty-tab:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: -2px; border-radius: var(--radius-xs); }
.pesty-tab__count {
  font-family: var(--font-mono); font-size: var(--text-2xs); line-height: 1;
  background: var(--n-100); color: var(--n-600); padding: 3px 7px; border-radius: var(--radius-pill);
}
.pesty-tab[aria-selected="true"] .pesty-tab__count { background: var(--brand-subtle); color: var(--brand-press); }
`;

if (typeof document !== 'undefined' && !document.getElementById('pesty-tabs-css')) {
  const s = document.createElement('style');
  s.id = 'pesty-tabs-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Tabs({ tabs, value, defaultValue, onChange, className = '', style = {}, ...rest }) {
  const [internal, setInternal] = React.useState(defaultValue != null ? defaultValue : (tabs[0] && tabs[0].id));
  const active = value != null ? value : internal;
  function select(id) {
    if (value == null) setInternal(id);
    if (onChange) onChange(id);
  }
  return (
    <div role="tablist" className={`pesty-tabs ${className}`} style={style} {...rest}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className="pesty-tab"
          onClick={() => select(t.id)}
        >
          {t.icon && <Icon name={t.icon} size={16} />}
          {t.label}
          {t.count != null && <span className="pesty-tab__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
