Compact status pill for dense tables & KPI tiles — 11px uppercase mono, color paired with a text label (never color alone). Keep to 2–3 states per table.

```jsx
<StatusPill variant="success">Active</StatusPill>
<StatusPill variant="warning">At risk</StatusPill>
<StatusPill variant="danger">Churned</StatusPill>
<StatusPill variant="info">Onboarding</StatusPill>
<StatusPill variant="neutral" dot={false}>Draft</StatusPill>
```

Set `dot={false}` to drop the leading dot. Drop it into a DataTable status column via a column `render`.
