import React from 'react';
import { Icon } from '../core/Icon.jsx';

/*
 * Dense data table. Column-driven, client-sortable, four separator styles.
 * Rules baked in (Practical UI / Master UI Design):
 *  - 11px uppercase mono headers; cell text 14px (never below 12px).
 *  - Numeric columns right-align + tabular-nums so digits line up for comparison.
 *  - Row height by density (40 / 48 / 56px); >=16px horizontal cell padding.
 *  - Separator style by data size: grid (spreadsheet) / horizontal (default)
 *    / zebra (large sets) / freeform (small sets).
 */
const CSS = `
.pesty-dt { width: 100%; border-collapse: collapse; font-family: var(--font-body); color: var(--text-body); }
.pesty-dt th {
  font-family: var(--font-mono); font-size: var(--text-2xs); font-weight: var(--fw-medium);
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--n-600);
  text-align: left; padding: 0 var(--cell-pad-x); height: 40px;
  background: var(--table-header-bg); border-bottom: 1px solid var(--border-strong);
  white-space: nowrap; user-select: none;
}
.pesty-dt th.num { text-align: right; }
.pesty-dt th.sortable { cursor: pointer; }
.pesty-dt th.sortable:hover { color: var(--text-strong); }
.pesty-dt__sort { display: inline-flex; align-items: center; gap: 6px; }
.pesty-dt th.num .pesty-dt__sort { flex-direction: row-reverse; }
.pesty-dt td {
  padding: 0 var(--cell-pad-x); height: var(--pesty-dt-row, 48px);
  font-size: var(--text-sm); color: var(--text-body); vertical-align: middle;
}
.pesty-dt td.num { text-align: right; font-variant-numeric: tabular-nums; }
.pesty-dt td.strong { color: var(--text-strong); font-weight: var(--fw-medium); }
.pesty-dt__sub { display: block; font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; font-weight: var(--fw-regular); }
.pesty-dt tbody tr { transition: background var(--dur-fast) var(--ease-standard); }
.pesty-dt tbody tr:hover { background: var(--table-row-hover); }
.pesty-dt--horizontal td { border-bottom: 1px solid var(--divider); }
.pesty-dt--grid td, .pesty-dt--grid th { border: 1px solid var(--divider); }
.pesty-dt--grid th { border-bottom-color: var(--border-strong); }
.pesty-dt--zebra tbody tr:nth-child(even) { background: var(--table-zebra); }
.pesty-dt--zebra tbody tr:nth-child(even):hover { background: var(--table-row-hover); }
.pesty-dt--sticky thead th { position: sticky; top: 0; z-index: 2; }
`;

if (typeof document !== 'undefined' && !document.getElementById('pesty-dt-css')) {
  const s = document.createElement('style');
  s.id = 'pesty-dt-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const ROW_H = { condensed: 'var(--row-condensed)', regular: 'var(--row-regular)', relaxed: 'var(--row-relaxed)' };

export function DataTable({
  columns,
  rows,
  density = 'regular',
  separators = 'horizontal',
  stickyHeader = false,
  defaultSort = null,
  getRowKey,
  className = '',
  style = {},
  ...rest
}) {
  const [sort, setSort] = React.useState(defaultSort);

  const sorted = React.useMemo(() => {
    if (!sort || !sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (row) => {
      let v = col && col.sortValue ? col.sortValue(row) : row[sort.key];
      if (col && col.numeric) v = parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0;
      return v;
    };
    return [...rows].sort((a, b) => {
      const av = val(a), bv = val(b);
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }, [rows, sort, columns]);

  function toggleSort(col) {
    if (!col.sortable) return;
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: 'asc' };
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' };
      return null; // third click clears the sort
    });
  }

  const cls = ['pesty-dt', `pesty-dt--${separators}`, stickyHeader && 'pesty-dt--sticky', className]
    .filter(Boolean).join(' ');

  return (
    <table className={cls} style={{ '--pesty-dt-row': ROW_H[density] || ROW_H.regular, ...style }} {...rest}>
      <thead>
        <tr>
          {columns.map((col) => {
            const active = sort && sort.key === col.key;
            const thCls = [col.numeric && 'num', col.sortable && 'sortable'].filter(Boolean).join(' ');
            return (
              <th
                key={col.key}
                className={thCls}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable ? () => toggleSort(col) : undefined}
                aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : (col.sortable ? 'none' : undefined)}
              >
                <span className="pesty-dt__sort">
                  {col.label}
                  {col.sortable && (
                    <Icon
                      name={active && sort.dir === 'asc' ? 'chevron-up' : 'chevron-down'}
                      size={12}
                      strokeWidth={2.5}
                      style={{ opacity: active ? 0.9 : 0.3 }}
                    />
                  )}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={getRowKey ? getRowKey(row, i) : (row.id != null ? row.id : i)}>
            {columns.map((col) => {
              const tdCls = [col.numeric && 'num', col.strong && 'strong'].filter(Boolean).join(' ');
              const content = col.render ? col.render(row) : row[col.key];
              const sub = col.sub ? col.sub(row) : null;
              return (
                <td
                  key={col.key}
                  className={tdCls}
                  style={col.align && !col.numeric ? { textAlign: col.align } : undefined}
                >
                  {content}
                  {sub != null && <span className="pesty-dt__sub">{sub}</span>}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
