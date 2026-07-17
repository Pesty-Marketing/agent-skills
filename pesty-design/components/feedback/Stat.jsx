import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Big result metric — the hero numbers Pesty leads with
 * ("$100,000 saved", "329 new customers", "$24.24 CPL").
 */
export function Stat({ value, label, icon, accent = true, align = 'left', onDark = false, className = '', ...rest }) {
  return (
    <div
      className={`pesty-stat ${className}`}
      style={{ textAlign: align, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: align === 'center' ? 'center' : 'flex-start' }}
      {...rest}
    >
      {icon && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 44, borderRadius: 'var(--radius-md)', marginBottom: '4px',
          background: onDark ? 'rgba(255,255,255,0.08)' : 'var(--brand-subtle)',
          color: 'var(--brand)',
        }}>
          <Icon name={icon} size={24} />
        </span>
      )}
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-extrabold)',
        fontSize: 'var(--text-4xl)', lineHeight: 1, letterSpacing: '-0.025em',
        color: accent ? 'var(--brand)' : (onDark ? '#fff' : 'var(--ink-900)'),
      }}>
        {value}
      </span>
      <span style={{
        fontSize: 'var(--text-sm)', fontWeight: 'var(--fw-medium)',
        lineHeight: 1.4, maxWidth: '24ch',
        color: onDark ? 'var(--text-on-dark-muted)' : 'var(--text-muted)',
      }}>
        {label}
      </span>
    </div>
  );
}
