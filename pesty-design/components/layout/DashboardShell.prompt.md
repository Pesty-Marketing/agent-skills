Dashboard layout frame — composes `Sidebar` + `Topbar` around a flexing content region. Cap content at 1320px, or set `fullBleed` for always-on analytics dashboards.

```jsx
<DashboardShell
  sidebar={<Sidebar items={nav} activeId={view} onSelect={setView}
             header={<img src="assets/brand/pesty-logo-white.svg" alt="Pesty" height={24} />} />}
  topbar={<Topbar title="Overview" search={<Input icon="search" placeholder="Search…" />}
            actions={<Avatar name="Andrew E" size={36} />} />}
  fullBleed
>
  <KpiGrid>{/* KpiTiles */}</KpiGrid>
  <SectionHeader title="Client portfolio" />
  <DataTable columns={columns} rows={rows} stickyHeader />
</DashboardShell>
```
