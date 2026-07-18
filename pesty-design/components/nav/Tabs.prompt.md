Navigation tabs for switching dashboard views — red active underline, optional icon + count. Controlled or uncontrolled.

```jsx
const tabs = [
  { id: 'overview', label: 'Overview', icon: 'bar-chart' },
  { id: 'clients', label: 'Clients', count: 128 },
  { id: 'reports', label: 'Reports' },
];

// uncontrolled
<Tabs tabs={tabs} defaultValue="overview" onChange={(id) => setView(id)} />

// controlled
<Tabs tabs={tabs} value={view} onChange={setView} />
```
