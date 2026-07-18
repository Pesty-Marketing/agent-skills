import React, { useState } from 'react';

/**
 * Code / snippet panel for API docs & references — deep-teal surface, JetBrains
 * Mono, an optional uppercase label and one-click copy. Colour syntax with the
 * token spans <span className="c"> (comment), <span className="k"> (keyword),
 * <span className="s"> (string) inside a fragment. Panel scrolls horizontally
 * on overflow so a wide line never breaks the page.
 */
export function CodeBlock({ children, label, copyText, className = '', ...rest }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const text = copyText != null ? copyText : (typeof children === 'string' ? children : '');
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <div className={`pesty-code ${className}`} {...rest}>
      {label && <div className="pesty-code__label">{label}</div>}
      <div className="pesty-code__panel">
        {copyText != null && (
          <button type="button" className="pesty-code__copy" onClick={copy} aria-label="Copy code">
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        <pre className="pesty-code__pre">{children}</pre>
      </div>
    </div>
  );
}
