import * as React from 'react';

/** Checkbox with the Pesty red fill + check icon. */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text shown beside the box. */
  label?: React.ReactNode;
}
export function Checkbox(props: CheckboxProps): JSX.Element;
