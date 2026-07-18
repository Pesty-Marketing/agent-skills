import React from 'react';
import { Card } from '../surfaces/Card.jsx';
import { Icon } from '../core/Icon.jsx';
import { DeltaPill } from '../feedback/DeltaPill.jsx';

/**
 * Compact KPI tile: mono uppercase label + 28px value + optional delta + icon
 * chip. Hierarchy is carried by weight/color, not just size — a muted label
 * over an extrabold ink value (Master UI Design: darker label, lighter value
 * is inverted here because the value is the hero). Set `accent` for Pesty Red.
 * Wrap several in a `KpiGrid`.
 */
export function KpiTile({
  label,
  value,
  delta,
  deltaGoodDirection = 'up',
  icon,
  accent = false,
  className = '',
  ...rest
}) {
  return (
    <Card padding="md" className={`pesty-kpi ${className}`} style={{ boxShadow: 'var(--shadow-sm)' }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--n-600)', fontWeight: 'var(--fw-medium)', lineHeight: 1.3,
        }}>
          {label}
        </span>
        {icon && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, borderRadius: 'var(--radius-sm)', flexShrink: 0,
            background: 'var(--brand-subtle)', color: 'var(--brand)',
          }}>
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-extrabold)',
          fontSize: 'var(--text-kpi)', lineHeight: 1, letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          color: accent ? 'var(--brand)' : 'var(--ink-900)',
        }}>
          {value}
        </span>
        {delta != null && (
          (typeof delta === 'string' || typeof delta === 'number')
            ? <DeltaPill value={delta} goodDirection={deltaGoodDirection} />
            : delta
        )}
      </div>
    </Card>
  );
}
