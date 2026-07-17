import * as React from 'react';
import { IconName } from '../core/Icon';

/** Text input with optional label, leading icon, hint and error state. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the input. */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — sets the error style and replaces the hint. */
  error?: string;
  /** Leading icon name. */
  icon?: IconName;
}
export function Input(props: InputProps): JSX.Element;
