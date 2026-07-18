import React from 'react';

/**
 * Responsive grid for KPI tiles — auto-fits as many `min`-wide columns as
 * fit, each flexing to fill. Default 220px min / 16px gap.
 */
export function KpiGrid({ children, min = 220, gap = 'var(--space-4)', className = '', style = {}, ...rest }) {
  const minStr = typeof min === 'number' ? `${min}px` : min;
  return (
    <div
      className={`pesty-kpigrid ${className}`}
      style={{
        display: 'grid',
        gap,
        gridTemplateColumns: `repeat(auto-fit, minmax(${minStr}, 1fr))`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
