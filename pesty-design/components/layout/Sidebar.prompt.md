Fixed-width deep-teal sidebar nav (one level of nesting max). Active item highlights Pesty Red; `{ groupLabel }` entries render dividers. Usually passed to `DashboardShell` as its `sidebar`.

```jsx
<Sidebar
  header={<img src="assets/brand/pesty-logo-white.svg" alt="Pesty" height={24} />}
  activeId={view}
  onSelect={setView}
  items={[
    { id: 'home', label: 'Overview', icon: 'home' },
    { id: 'clients', label: 'Clients', icon: 'users', count: 128 },
    { groupLabel: 'Reporting' },
    { id: 'seo', label: 'SEO', icon: 'bar-chart', children: [
      { id: 'seo-rank', label: 'Rankings' },
      { id: 'seo-traffic', label: 'Traffic' },
    ] },
  ]}
  footer={<span style={{ fontSize: 'var(--text-xs)' }}>Andrew E.</span>}
/>
```
