import React from 'react';

/** Circular avatar for team members & author bylines. Optional red ring. */
export function Avatar({ src, alt = '', name, size = 56, ring = false, className = '', ...rest }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '';
  return (
    <span
      className={`pesty-avatar ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 'var(--radius-pill)',
        overflow: 'hidden', flexShrink: 0,
        background: 'var(--ink-700)', color: '#fff',
        fontFamily: 'var(--font-display)', fontWeight: 'var(--fw-semibold)',
        fontSize: size * 0.36,
        boxShadow: ring ? '0 0 0 3px var(--n-0), 0 0 0 5px var(--brand)' : 'none',
      }}
      {...rest}
    >
      {src
        ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials}
    </span>
  );
}
