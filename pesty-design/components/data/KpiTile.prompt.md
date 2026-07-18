Compact KPI tile for dashboard headers — mono label, 28px value, optional delta + icon chip. Wrap several in a `KpiGrid`. Drop the label where the value is self-evident.

```jsx
<KpiGrid>
  <KpiTile label="Active clients" value="1,284" delta="+12%" icon="users" />
  <KpiTile label="Blended CPL" value="$24.24" delta="-8%" deltaGoodDirection="down" icon="zap" />
  <KpiTile label="MRR" value="$182K" delta="+4%" icon="trending-up" accent />
  <KpiTile label="Win rate" value="92%" delta={0} icon="target" />
</KpiGrid>
```

`accent` colors the value Pesty Red; `deltaGoodDirection="down"` makes a falling cost read green.
