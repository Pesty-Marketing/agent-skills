Sticky top bar for the content region — title, optional search slot, right-aligned actions. Passed to `DashboardShell` as its `topbar`.

```jsx
<Topbar
  title="Client portfolio"
  search={<Input icon="search" placeholder="Search clients…" />}
  actions={<>
    <IconButton icon="bell" aria-label="Notifications" variant="ghost" />
    <Avatar name="Andrew E" size={36} />
  </>}
/>
```
