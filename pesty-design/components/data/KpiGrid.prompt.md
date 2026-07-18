Responsive auto-fit grid for `KpiTile`s — columns flex to fill the row and wrap when they hit `min` width.

```jsx
<KpiGrid min={220} gap="var(--space-4)">
  <KpiTile label="Active clients" value="1,284" delta="+12%" icon="users" />
  <KpiTile label="MRR" value="$182K" delta="+4%" icon="trending-up" accent />
</KpiGrid>
```
