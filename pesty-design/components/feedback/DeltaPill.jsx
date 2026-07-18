import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Trend-delta chip (+12%, -5%) with a directional arrow and semantic color.
 * Direction is derived from the sign of a numeric `value`, or set explicitly.
 * `goodDirection` flips the color for metrics where down is good (CPL, CAC,
 * churn) — so a falling cost reads green, not red.
 */
export function DeltaPill({ value, direction, goodDirection = 'up', showIcon = true, className = '', ...rest }) {
  let dir = direction;
  if (!dir) {
    const num = typeof value === 'number'
      ? value
      : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    dir = (isNaN(num) || num === 0) ? 'flat' : (num > 0 ? 'up' : 'down');
  }
  const isGood = dir === 'flat' ? null : dir === goodDirection;
  const palette = isGood === null
    ? { color: 'var(--n-600)', background: 'var(--n-100)' }
    : isGood
      ? { color: 'var(--green-600)', background: 'var(--success-bg)' }
      : { color: 'var(--red-700)', background: 'var(--danger-bg)' };
  const iconName = dir === 'up' ? 'trending-up' : dir === 'down' ? 'trending-down' : null;
  const display = typeof value === 'number' ? `${value > 0 ? '+' : ''}${value}` : value;
  return (
    <span
      className={`pesty-deltapill ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontFamily: 'var(--font-mono)', fontWeight: 'var(--fw-medium)',
        fontSize: 'var(--text-2xs)', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        padding: '4px 8px', borderRadius: 'var(--radius-pill)',
        ...palette,
      }}
      {...rest}
    >
      {showIcon && iconName && <Icon name={iconName} size={12} strokeWidth={2.5} />}
      {display}
    </span>
  );
}
