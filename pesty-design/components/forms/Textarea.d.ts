import * as React from 'react';

/** Multi-line text input sharing the Pesty field styling. */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}
export function Textarea(props: TextareaProps): JSX.Element;
