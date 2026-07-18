Dense, column-driven data table with client-side sorting. Numeric columns right-align with tabular-nums; drop `StatusPill`/`DeltaPill` into a column via `render`; condense a second field with `sub`.

```jsx
const columns = [
  { key: 'name', label: 'Client', strong: true, sortable: true,
    sub: (r) => r.city },
  { key: 'mrr', label: 'MRR', numeric: true, sortable: true,
    render: (r) => `$${r.mrr.toLocaleString()}` },
  { key: 'cpl', label: 'CPL', numeric: true, sortable: true,
    render: (r) => <DeltaPill value={r.cpl} goodDirection="down" /> },
  { key: 'status', label: 'Status',
    render: (r) => <StatusPill variant={r.statusVariant}>{r.status}</StatusPill> },
];

<DataTable columns={columns} rows={rows}
  density="regular" separators="horizontal" stickyHeader
  defaultSort={{ key: 'mrr', dir: 'desc' }} />
```

`density`: `condensed` (40px) · `regular` (48px) · `relaxed` (56px). `separators`: `grid` (spreadsheet) · `horizontal` (default) · `zebra` (large sets) · `freeform` (small sets). Clicking a sortable header cycles asc → desc → cleared.
