import * as React from 'react';

export interface DataTableColumn<Row = any> {
  /** Row-object key this column reads. */
  key: string;
  /** Header label. */
  label: React.ReactNode;
  /** Numeric column — right-aligns the cell and applies tabular-nums + numeric sort. */
  numeric?: boolean;
  /** Emphasize cell text (used for the primary/identity column). */
  strong?: boolean;
  /** Enable click-to-sort on this column (asc → desc → cleared). */
  sortable?: boolean;
  /** Horizontal alignment for non-numeric columns. */
  align?: 'left' | 'center' | 'right';
  /** Fixed column width (e.g. `"180px"`, `"20%"`). */
  width?: string;
  /** Custom cell renderer; receives the row. Return a StatusPill/DeltaPill/etc. */
  render?: (row: Row) => React.ReactNode;
  /** Condensed subtext shown under the cell (e.g. an email under a name). */
  sub?: (row: Row) => React.ReactNode;
  /** Override the value used for sorting (defaults to `row[key]`). */
  sortValue?: (row: Row) => string | number;
}

export interface DataTableSort {
  key: string;
  dir: 'asc' | 'desc';
}

/** Dense, column-driven, client-sortable data table. */
export interface DataTableProps<Row = any> extends React.HTMLAttributes<HTMLTableElement> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Row height. @default "regular" (40 / 48 / 56px) */
  density?: 'condensed' | 'regular' | 'relaxed';
  /** Separator style. @default "horizontal" */
  separators?: 'grid' | 'horizontal' | 'zebra' | 'freeform';
  /** Pin the header on vertical scroll. @default false */
  stickyHeader?: boolean;
  /** Initial sort. @default null */
  defaultSort?: DataTableSort | null;
  /** Stable row key (defaults to `row.id` then index). */
  getRowKey?: (row: Row, index: number) => React.Key;
}
export function DataTable<Row = any>(props: DataTableProps<Row>): JSX.Element;
