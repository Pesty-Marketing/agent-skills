import * as React from 'react';

export interface PipelineStep {
  /** Step label. */
  label: React.ReactNode;
}

/** Horizontal step / flow strip with arrow separators. */
export interface PipelineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered stages — plain strings or { label } objects. */
  steps: Array<string | PipelineStep>;
}
export function Pipeline(props: PipelineProps): JSX.Element;
