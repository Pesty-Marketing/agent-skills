import React from 'react';

/** Multi-line text input. Shares Input's field styling. */
export function Textarea({ label, hint, error, id, className = '', rows = 4, ...rest }) {
  const fieldId = id || (label ? `t-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className="pesty-field">
      {label && <label className="pesty-field__label" htmlFor={fieldId}>{label}</label>}
      <textarea
        id={fieldId}
        rows={rows}
        className={`pesty-input ${error ? 'pesty-input--error' : ''} ${className}`}
        {...rest}
      />
      {(hint || error) && (
        <span className={`pesty-field__hint ${error ? 'pesty-field__hint--error' : ''}`}>{error || hint}</span>
      )}
    </div>
  );
}
