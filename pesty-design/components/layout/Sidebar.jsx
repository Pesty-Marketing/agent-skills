import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Fixed-width deep-teal sidebar nav. Items may nest ONE level (Master UI
 * Design: don't nest more than two deep). Active item highlights in Pesty
 * Red; a `{ groupLabel }` entry renders a section divider.
 */
const CSS = `
.pesty-sidebar {
  width: var(--sidebar-w); flex-shrink: 0; background: var(--ink-900);
  color: var(--text-on-dark-muted); display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh; overflow-y: auto;
}
.pesty-sidebar__head { padding: 16px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-on-dark); min-height: var(--topbar-h); box-sizing: border-box; }
.pesty-sidebar__nav { padding: 12px; display: flex; flex-direction: column; gap: 2px; flex: 1; }
.pesty-sidebar__group { font-family: var(--font-mono); font-size: var(--text-2xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-on-dark-faint); padding: 14px 12px 6px; }
.pesty-navitem {
  appearance: none; background: none; border: none; cursor: pointer; width: 100%; text-align: left;
  display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-sm);
  font-family: var(--font-body); font-weight: var(--fw-medium); font-size: var(--text-sm);
  color: var(--text-on-dark-muted);
  transition: background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
}
.pesty-navitem:hover { background: rgba(255,255,255,0.06); color: #fff; }
.pesty-navitem:focus-visible { outline: 2px solid var(--focus-ring-dark); outline-offset: -2px; }
.pesty-navitem[aria-current="page"] { background: var(--brand); color: #fff; }
.pesty-navitem__count { margin-left: auto; font-family: var(--font-mono); font-size: var(--text-2xs); opacity: 0.75; }
.pesty-subnav { display: flex; flex-direction: column; gap: 1px; margin: 1px 0 4px; padding-left: 16px; }
.pesty-navitem--sub { padding: 7px 12px; color: var(--text-on-dark-faint); font-weight: var(--fw-regular); }
.pesty-navitem--sub:hover { color: #fff; background: rgba(255,255,255,0.05); }
.pesty-navitem--sub[aria-current="page"] { background: rgba(217,4,41,0.20); color: #fff; }
.pesty-sidebar__foot { padding: 14px 16px; border-top: 1px solid var(--border-on-dark); }
`;

if (typeof document !== 'undefined' && !document.getElementById('pesty-sidebar-css')) {
  const s = document.createElement('style');
  s.id = 'pesty-sidebar-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function Sidebar({ items = [], header, footer, activeId, onSelect, className = '', style = {}, ...rest }) {
  const select = (id) => () => { if (onSelect) onSelect(id); };
  return (
    <aside className={`pesty-sidebar ${className}`} style={style} {...rest}>
      {header && <div className="pesty-sidebar__head">{header}</div>}
      <nav className="pesty-sidebar__nav">
        {items.map((it, i) => {
          if (it.groupLabel) return <div key={`g-${i}`} className="pesty-sidebar__group">{it.groupLabel}</div>;
          const kids = it.children || [];
          return (
            <React.Fragment key={it.id}>
              <button
                type="button"
                className="pesty-navitem"
                aria-current={activeId === it.id ? 'page' : undefined}
                onClick={select(it.id)}
              >
                {it.icon && <Icon name={it.icon} size={18} />}
                {it.label}
                {it.count != null && <span className="pesty-navitem__count">{it.count}</span>}
              </button>
              {kids.length > 0 && (
                <div className="pesty-subnav">
                  {kids.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="pesty-navitem pesty-navitem--sub"
                      aria-current={activeId === c.id ? 'page' : undefined}
                      onClick={select(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      {footer && <div className="pesty-sidebar__foot">{footer}</div>}
    </aside>
  );
}
