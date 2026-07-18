import React from 'react';

/**
 * Responsive key→value definition list for spec / metadata blocks (API params,
 * "under the hood" facts, record fields). Auto-fits into columns; a mono
 * uppercase key sits over a body value. Values accept JSX (links, <code>,
 * StatusPills).
 */
export function SpecList({ items = [], min = 260, className = '', style = {}, ...rest }) {
  const minStr = typeof min === 'number' ? `${min}px` : min;
  return (
    <dl className={`pesty-spec ${className}`} style={{ '--pesty-spec-min': minStr, ...style }} {...rest}>
      {items.map((it, i) => (
        <div className="pesty-spec__row" key={it.key != null ? String(it.key) : i}>
          <dt className="pesty-spec__key">{it.key}</dt>
          <dd className="pesty-spec__val">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
