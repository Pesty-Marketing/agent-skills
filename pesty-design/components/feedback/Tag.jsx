import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Checkmark feature item — the bordered pill used across Pesty for
 * "Built exclusively for pest control" style trust points.
 */
export function Tag({ children, icon = 'check', tone = 'brand', className = '', ...rest }) {
  const tones = {
    brand:   { iconColor: 'var(--brand)', ring: 'var(--border)' },
    neutral: { iconColor: 'var(--n-500)', ring: 'var(--border)' },
    onDark:  { iconColor: 'var(--brand)', ring: 'var(--border-on-dark)' },
  };
  const t = tones[tone];
  const onDark = tone === 'onDark';
  return (
    <span
      className={`pesty-tag ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '9px',
        fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-medium)',
        fontSize: 'var(--text-sm)', lineHeight: 1.2,
        color: onDark ? '#fff' : 'var(--text-strong)',
        background: onDark ? 'rgba(255,255,255,0.06)' : 'var(--n-0)',
        border: `1.5px solid ${t.ring}`,
        borderRadius: 'var(--radius-pill)', padding: '9px 16px 9px 13px',
        whiteSpace: 'nowrap',
      }}
      {...rest}
    >
      <Icon name={icon} size={16} style={{ color: t.iconColor }} strokeWidth={2.5} />
      {children}
    </span>
  );
}
