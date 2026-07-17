import * as React from 'react';

/** Native select styled to match the Pesty field system. Pass <option> children. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}
export function Select(props: SelectProps): JSX.Element;
