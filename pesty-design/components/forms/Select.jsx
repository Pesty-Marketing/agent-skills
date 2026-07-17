import React from 'react';
import { Icon } from '../core/Icon.jsx';

/** Native select styled to match the Pesty field system. */
export function Select({ label, hint, error, id, children, className = '', ...rest }) {
  const fieldId = id || (label ? `s-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className="pesty-field">
      {label && <label className="pesty-field__label" htmlFor={fieldId}>{label}</label>}
      <div className="pesty-inputwrap">
        <select
          id={fieldId}
          className={`pesty-input ${error ? 'pesty-input--error' : ''} ${className}`}
          style={{ appearance: 'none', paddingRight: '42px', cursor: 'pointer' }}
          {...rest}
        >
          {children}
        </select>
        <Icon name="chevron-down" size={18} style={{ position: 'absolute', right: '14px', left: 'auto', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      </div>
      {(hint || error) && (
        <span className={`pesty-field__hint ${error ? 'pesty-field__hint--error' : ''}`}>{error || hint}</span>
      )}
    </div>
  );
}
