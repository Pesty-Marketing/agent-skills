import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * Horizontal step / flow strip — ordered stages joined by arrows, used to show
 * a process ("scrape → normalize → enrich → serve"). Wraps onto multiple lines
 * on narrow viewports. Steps are strings or { label } objects.
 */
export function Pipeline({ steps = [], className = '', ...rest }) {
  return (
    <div className={`pesty-pipeline ${className}`} {...rest}>
      {steps.map((s, i) => {
        const label = typeof s === 'string' ? s : s.label;
        return (
          <React.Fragment key={i}>
            <span className="pesty-pipeline__step">{label}</span>
            {i < steps.length - 1 && (
              <span className="pesty-pipeline__arrow" aria-hidden="true">
                <Icon name="arrow-right" size={16} />
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
